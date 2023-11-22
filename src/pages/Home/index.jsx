import React from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "react-alert";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  Fab,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AddCircleOutlineOutlined, CheckCircleOutline, LogoutOutlined, SaveAsOutlined } from "@mui/icons-material";
import { createFilterOptions } from "@mui/material/Autocomplete";
import { green } from '@mui/material/colors';

import {
  addCollection,
  getCollectionsWithLocations,
  getCollectionsWithoutLocations,
  signOutUser,
  removeCollection,
  getLocationList,
  getKeyList,
} from "../../services/fbService";
import preview from "../../images/preview.jpg";
import { Collection, CollectionWithInputs } from "../../components";
import mapToKeyList from "../../utils/mapToKeyList";

const Home = () => {
  const navigate = useNavigate();
  const alert = useAlert();
  const filter = createFilterOptions();
  const user = localStorage.getItem("gMail");
  const uid = localStorage.getItem("gUId");

  const [loading, setLoading] = React.useState(true);
  const [addingProcess, setAddingProcess] = React.useState({
    opened: false,
    loading: false,
    error: false,
    success: false
  });
  const [data, setData] = React.useState(null);
  const [collection, setCollection] = React.useState({});
  const [locationList, setLocationList] = React.useState([]);
  const [keyList, setKeyList] = React.useState(new Map());
  const [isRemoving, setIsRemoving] = React.useState(null)

  React.useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const user = localStorage.getItem("gUId");

    if (user) {
      try {
        const list = await getLocationList(user);
        setLocationList([...list]);

        const keys = await getKeyList(user);
        setKeyList(keys);

        const collectionsWithLocations = await getCollectionsWithLocations(
          user
        );
        const collectionsWithoutLocations =
          await getCollectionsWithoutLocations(user);

        const collectionMap = new Map();

        collectionsWithLocations
          .map((item) => Object.values(item))
          .flat(1)
          .forEach((el) => {
            if (collectionMap.has(el.location)) {
              const items = collectionMap.get(el.location);

              collectionMap.set(el.location, [...items, { ...el }]);
            } else {
              collectionMap.set(el.location, [el]);
            }
          });

        setData({
          collectionsWithLocations: [...Array.from(collectionMap)],
          collectionsWithoutLocations: [...collectionsWithoutLocations],
        });
        setLoading(false);
      } catch (error) {
        alert.error(error);
        throw new Error(error);
      }
    } else {
      navigate("/login");
    }
  };

  const handleAddNewCollection = async () => {
    setAddingProcess(prevState => ({ ...prevState, loading: true }))

    if (collection?.title && collection?.key) {
      if (
        keyList &&
        keyList
          .get(collection.location ? collection.location : "withoutLocation")
          ?.includes(collection.key)
      ) {
        alert.error("There is already a similar key in this location");

        return;
      } else {
        setKeyList((prevState) => {
          if (collection.location) {
            if (prevState.has(collection.location)) {
              return prevState.set(collection.location, [
                ...prevState.get(collection.location),
                collection.key,
              ]);
            } else {
              return prevState.set(collection.location, [collection.key]);
            }
          } else {
            return prevState.set(
              "withoutLocation",
              prevState.get(collection.location)
                ? [...prevState.get("withoutLocation"), collection.key]
                : [collection.key]
            );
          }
        });
      }

      const result = await addCollection(
        uid,
        collection.title,
        collection?.description ?? "",
        collection.key,
        collection?.location ?? null,
        null
      );

      if (collection?.location && !locationList.includes(collection.location)) {
        setLocationList((prevState) => [...prevState, collection.location]);
      }

      if (result) {
        alert.success("New collection added successfully");
        setAddingProcess(prevState => ({ ...prevState, success: true }))

        setData((prevState) => {
          if (collection.location) {
            const selectedArray = prevState.collectionsWithLocations.filter(
              (arr) => arr[0] === collection.location
            );

            if (selectedArray.length) {
              return {
                ...prevState,
                collectionsWithLocations: [
                  ...prevState.collectionsWithLocations.map((arr) => {
                    if (arr[0] === collection.location) {
                      return [
                        arr[0],
                        [
                          ...arr[1],
                          {
                            name: collection.title,
                            description: collection?.description ?? "",
                            key: collection.key,
                            location: collection.location,
                            dateAdded: new Date().toDateString(),
                          },
                        ],
                      ];
                    } else {
                      return arr;
                    }
                  }),
                ],
              };
            } else {
              return {
                ...prevState,
                collectionsWithLocations: [
                  ...prevState.collectionsWithLocations,
                  [
                    collection.location,
                    [
                      {
                        name: collection.title,
                        description: collection?.description ?? "",
                        key: collection.key,
                        location: collection.location,
                        dateAdded: new Date().toDateString(),
                      },
                    ],
                  ],
                ],
              };
            }
          } else {
            return {
              ...prevState,
              collectionsWithoutLocations: [
                ...prevState.collectionsWithoutLocations,
                {
                  name: collection.title,
                  description: collection?.description ?? "",
                  key: collection.key,
                  location: null,
                  dateAdded: new Date().toDateString(),
                },
              ],
            };
          }
        });
        setCollection({});
        setAddingProcess((prevState) => setAddingProcess({ ...prevState, opened: false }));
      }
    } else {
      alert.error("Title and Key is important");
    }

    setAddingProcess(prevState => ({ ...prevState, loading: true }))
  };

  const handleSignOut = async () => {
    await signOutUser();

    navigate("/login");
  };

  const handleEdit = () => {
    console.log("edit");
  };

  const handleRemove = async (collection, location) => {
    const result = await removeCollection(uid, collection, location);

    if (result) {
      alert.success("The collection has been removed successfully");
      setIsRemoving(null)

      setData((prevState) => {
        if (location) {
          return {
            ...prevState,
            collectionsWithLocations: [
              ...prevState.collectionsWithLocations.map((arr) => {
                if (location === arr[0]) {
                  return [
                    arr[0],
                    [...arr[1].filter(({ name }) => name !== collection)],
                  ];
                } else {
                  return [...arr];
                }
              }),
            ],
          };
        } else {
          return {
            ...prevState,
            collectionsWithoutLocations: [
              ...prevState.collectionsWithoutLocations.filter(
                ({ name }) => name !== collection
              ),
            ],
          };
        }
      });
    } else {
      alert.error("Error while removing the collection");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: "50vh",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <Typography variant="h6" gutterBottom>
            {user}
          </Typography>
          <i
            style={{ cursor: "pointer" }}
            onClick={() => {
              navigator.clipboard.writeText(uid);
              alert.info("The key is copied");
            }}
          >
            {uid}
          </i>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "space-around",
            marginTop: 30,
          }}
        >
          <Typography variant="h3" gutterBottom>
            Ads Admin Panel
          </Typography>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <IconButton
            onClick={(prevState) => setAddingProcess({ ...prevState, opened: true })}
            aria-label="add"
            style={{ marginRight: 20 }}
          >
            <AddCircleOutlineOutlined color="success" />
          </IconButton>
          <IconButton
            onClick={handleSignOut}
            aria-label="logout"
            style={{ marginRight: 20 }}
          >
            <LogoutOutlined />
          </IconButton>
        </div>
      </div>

      <Drawer
        open={addingProcess.opened}
        onClose={(prevState) => setAddingProcess({ ...prevState, opened: false })}
        anchor="right"
      >
        <Box
          sx={{
            width: "right" === "top" || "right" === "bottom" ? "auto" : 450,
            padding: 5
          }}
          role="presentation"
        >
          <Typography variant="h3" gutterBottom>
            New collection
          </Typography>
          <Stack spacing={1} direction="column">
            <TextField
              value={collection?.title || ''}
              onChange={(e) => {
                setCollection((prevState) => ({
                  ...prevState,
                  title: e.target.value,
                }))
              }}
              required
              id="outlined-size-small-title"
              label="Title"
              variant="outlined"
              fullWidth
            />
            <TextField
              value={collection?.description || ''}
              onChange={(e) =>
                setCollection((prevState) => ({
                  ...prevState,
                  description: e.target.value,
                }))
              }
              id="outlined-size-small-description"
              label="Description"
              variant="outlined"
              sx={{ width: '100%' }}
            // fullWidth
            />
            <Autocomplete
              value={collection?.key || null}
              onChange={(event, newValue) => {
                if (typeof newValue === "string") {
                  setCollection((prevState) => ({
                    ...prevState,
                    key: newValue,
                  }));
                } else if (newValue && newValue.inputValue) {
                  setCollection((prevState) => ({
                    ...prevState,
                    key: newValue.inputValue,
                  }));
                } else {
                  setCollection((prevState) => ({
                    ...prevState,
                    key: newValue,
                  }));
                }
              }}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);

                const { inputValue } = params;
                const isExisting = options.some(
                  (option) => inputValue === option
                );
                if (inputValue !== "" && !isExisting) {
                  filtered.push(inputValue);
                }

                return filtered;
              }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="free-solo-keys"
              options={
                keyList && mapToKeyList(keyList).length
                  ? mapToKeyList(keyList)
                  : []
              }
              getOptionLabel={(option) => option}
              renderOption={(props, option) => <li {...props}>{option}</li>}
              sx={{ width: 300 }}
              freeSolo
              fullWidth
              renderInput={(params) => (
                <TextField
                  required
                  id="outlined-size-small-key"
                  label="Key"
                  variant="outlined"
                  sx={{ width: 450 }}
                  {...params}
                />
              )}
            />
            <Autocomplete
              fullWidth
              value={collection?.location || null}
              onChange={(event, newValue) => {
                if (typeof newValue === "string") {
                  setCollection((prevState) => ({
                    ...prevState,
                    location: newValue,
                  }));
                } else if (newValue && newValue.inputValue) {
                  setCollection((prevState) => ({
                    ...prevState,
                    location: newValue.inputValue,
                  }));
                } else {
                  setCollection((prevState) => ({
                    ...prevState,
                    location: newValue,
                  }));
                }
              }}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);

                const { inputValue } = params;
                const isExisting = options.some(
                  (option) => inputValue === option
                );
                if (inputValue !== "" && !isExisting) {
                  filtered.push(inputValue);
                }

                return filtered;
              }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="free-solo-locations"
              options={locationList}
              getOptionLabel={(option) => option}
              renderOption={(props, option) => <li {...props}>{option}</li>}
              sx={{ width: 300 }}
              freeSolo
              renderInput={(params) => (
                <TextField
                  id="outlined-size-small-location"
                  label="Location"
                  variant="outlined"
                  fullWidth
                  sx={{ width: 450 }}
                  {...params}
                />
              )}
            />
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Box sx={{ m: 2, position: 'relative' }}>
              <Fab
                aria-label="save"
                color="primary"
                sx={{
                  ...(addingProcess.success && {
                    bgcolor: green[500],
                    '&:hover': {
                      bgcolor: green[700],
                    },
                  }),
                }}
                onClick={handleAddNewCollection}
              >
                {addingProcess.success ? <CheckCircleOutline /> : <SaveAsOutlined />}
              </Fab>
              {loading && (
                <CircularProgress
                  size={68}
                  sx={{
                    color: green[500],
                    position: 'absolute',
                    top: -6,
                    left: -6,
                    zIndex: 1,
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Drawer>

      {data &&
        data.collectionsWithLocations &&
        data.collectionsWithLocations.length > 0 &&
        data.collectionsWithLocations.map(([title, item], i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flex: 1,
              width: "90%",
              marginTop: 50,
              flexDirection: "column",
            }}
          >
            <div style={{ maxWidth: "40%" }}>
              <Typography>{title}</Typography>
              <Divider style={{ marginBottom: 15 }} />
            </div>

            <div
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {item && item.length > 0 ? (
                item.map(({ name, description, location, data, key }, i) => (
                  <Collection
                    key={i + name}
                    name={name}
                    description={description}
                    onPress={() =>
                      navigate(`collection/${name}`, {
                        state: {
                          collectionName: name,
                          withLocation: true,
                          location,
                        },
                      })
                    }
                    image={data && data.length > 0 ? data[0][0] : preview}
                    buttonList={[
                      { text: "Edit", onClick: handleEdit },
                      {
                        text: "Remove",
                        onClick: () => setIsRemoving({
                          name,
                          location
                        }),
                        style: { color: "red" },
                      },
                    ]}
                  />
                ))
              ) : (
                <div>Empty collection</div>
              )}
            </div>
          </div>
        ))}

      {data &&
        data.collectionsWithoutLocations &&
        data.collectionsWithoutLocations.length > 0 && (
          <div
            style={{
              display: "flex",
              flex: 1,
              width: "90%",
              marginTop: 100,
              flexDirection: "column",
            }}
          >
            <div style={{ maxWidth: "40%" }}>
              <Typography>Without location</Typography>
              <Divider style={{ marginBottom: 15 }} />
            </div>
            <div
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {data.collectionsWithoutLocations.map(
                ({ name, description, data, key }, i) => (
                  <Collection
                    key={i}
                    name={name}
                    description={description}
                    onPress={() =>
                      navigate(`collection/${name}`, {
                        state: {
                          collectionName: name,
                          withLocation: false,
                        },
                      })
                    }
                    image={data && data.length > 0 ? data[0][0] : preview}
                    buttonList={[
                      { text: "Edit", onClick: handleEdit },
                      {
                        text: "Remove",
                        onClick: () => setIsRemoving({
                          name
                        }),
                        style: { color: "red" },
                      },
                    ]}
                  />
                )
              )}
            </div>
          </div>
        )}

      <Dialog
        open={!!isRemoving}
        onClose={() => setIsRemoving(null)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            If you press "Remove", it permanently delete selected collection
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRemoving(null)}>Cancel</Button>
          <Button color='error' onClick={() => handleRemove(isRemoving.name, isRemoving.location)} autoFocus>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Home;
