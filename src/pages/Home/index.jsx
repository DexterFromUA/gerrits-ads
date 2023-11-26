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
import {
  AddCircleOutlineOutlined,
  CheckCircleOutline,
  LogoutOutlined,
  SaveAsOutlined,
} from "@mui/icons-material";
import { createFilterOptions } from "@mui/material/Autocomplete";
import { green } from "@mui/material/colors";

import {
  addCollection,
  getCollectionsWithLocations,
  getCollectionsWithoutLocations,
  signOutUser,
  removeCollection,
  getLocationList,
  getKeyList,
  updateCollection,
} from "../../services/fbService";
import preview from "../../images/preview.jpg";
import { Collection } from "../../components";
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
    success: false,
    type: "",
  });
  const [data, setData] = React.useState(null);
  const [collection, setCollection] = React.useState({});
  const [editCollection, setEditCollection] = React.useState({});
  const [locationList, setLocationList] = React.useState([]);
  const [keyList, setKeyList] = React.useState(new Map());
  const [isRemoving, setIsRemoving] = React.useState(null);
  const [isLogout, setIsLogout] = React.useState(false);

  React.useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleAddNewCollection = async (isEdit = false) => {
    const parsedLocation = collection?.location
      ? collection.location.replace(/[&\/\\#+()$~%.'":*?<>{}]/g, "")
      : null;
    setAddingProcess((prevState) => ({ ...prevState, loading: true }));

    if (collection?.name && collection?.key) {
      if (
        !isEdit &&
        keyList &&
        keyList
          .get(parsedLocation ? parsedLocation : "withoutLocation")
          ?.includes(collection.key)
      ) {
        alert.error("There is already a similar key in this location");
        setAddingProcess((prevState) => ({ ...prevState, loading: false }));
        return;
      } else if (
        isEdit &&
        collection.key !== editCollection.key &&
        keyList &&
        keyList
          .get(parsedLocation ? parsedLocation : "withoutLocation")
          .filter((el) => el === collection.key).length > 0
      ) {
        alert.error(
          "There is already a similar key in this location while edit"
        );
        setAddingProcess((prevState) => ({ ...prevState, loading: false }));
        return;
      } else {
        const locationKey = parsedLocation ?? "withoutLocation";

        setKeyList((prevState) => {
          if (prevState.has(locationKey)) {
            return prevState.set(locationKey, [
              ...prevState.get(locationKey),
              collection.key,
            ]);
          } else {
            return prevState.set(locationKey, [collection.key]);
          }
        });
      }

      const result = await addCollection(
        uid,
        collection.name,
        collection?.description ?? "",
        collection.key,
        parsedLocation,
        editCollection?.data ?? []
      );

      if (result) {
        if (collection?.location && !locationList.includes(parsedLocation)) {
          setLocationList((prevState) => [...prevState, parsedLocation]);
        }
        alert.success(
          `New collection ${isEdit ? "edited" : "added"} successfully`
        );

        setData((prevState) => {
          if (parsedLocation) {
            const selectedArray = prevState.collectionsWithLocations.filter(
              (arr) => arr[0] === parsedLocation
            );

            if (selectedArray.length) {
              return {
                ...prevState,
                collectionsWithLocations: [
                  ...prevState.collectionsWithLocations.map((arr) => {
                    if (arr[0] === parsedLocation) {
                      return [
                        arr[0],
                        [
                          ...arr[1],
                          {
                            name: collection.name,
                            description: collection?.description ?? "",
                            key: collection.key,
                            location: parsedLocation,
                            dateAdded: new Date().toDateString(),
                            data: collection?.data ?? []
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
                    parsedLocation,
                    [
                      {
                        name: collection.name,
                        description: collection?.description ?? "",
                        key: collection.key,
                        location: parsedLocation,
                        dateAdded: new Date(),
                        data: collection?.data ?? []
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
                  name: collection.name,
                  description: collection?.description ?? "",
                  key: collection.key,
                  location: null,
                  dateAdded: new Date(),
                  data: collection?.data ?? []
                },
              ],
            };
          }
        });
        setCollection({});
        setEditCollection({});
        setAddingProcess((prevState) => ({
          ...prevState,
          opened: false,
          type: "",
        }));
      }
    } else {
      alert.error("Name and Key is important");
    }

    setAddingProcess((prevState) => ({ ...prevState, loading: false }));
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();

      navigate("/login");
    } catch (error) {
      throw new Error(error);
    }
  };

  const handleEdit = async () => {
    if ((collection.name || collection.name) && collection.key) {
      try {
        const result = await handleRemove(
          editCollection.name,
          editCollection?.location ?? "",
          collection.key,
          true
        );
        if (result) {
          await handleAddNewCollection(true);
        }
      } catch (error) {
        alert.error("Error while updating");
        throw new Error(error);
      }
    } else {
      alert.error("name and Key is important");
    }
  };

  const handleRemove = async (collectionName, location, key, isEdit) => {
    if (isEdit) {
      const parsedLocation = collection?.location
        ? collection.location.replace(/[&\/\\#+()$~%.'":*?<>{}]/g, "")
        : null;

      if (
        (collection.location === location &&
          collection.key !== editCollection.key &&
          keyList
            .get(parsedLocation ?? "withoutLocation")
            .filter((el) => el === key).length > 0) ||
        keyList
          .get(parsedLocation ?? "withoutLocation")
          .filter((el) => el === key).length > 0
      ) {
        alert.error(
          "There is already a similar key in this location while edit"
        );
        return false;
      }
    }

    const result = await removeCollection(uid, collectionName, location);

    if (result) {
      !isEdit && alert.success("The collection has been removed successfully");
      setIsRemoving(null);

      setData((prevState) => {
        if (location) {
          return {
            ...prevState,
            collectionsWithLocations: [
              ...prevState.collectionsWithLocations.map((arr) => {
                if (location === arr[0]) {
                  return [
                    arr[0],
                    [...arr[1].filter(({ name }) => name !== collectionName)],
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
                ({ name }) => name !== collectionName
              ),
            ],
          };
        }
      });

      const locationKey = location ?? "withoutLocation";
      setKeyList((prevState) => {
        if (prevState.has(locationKey)) {
          return prevState.set(locationKey, [
            ...prevState
              .get(locationKey)
              .filter((el) => el !== editCollection.key),
          ]);
        }
      });

      return true;
    } else {
      alert.error("Error while removing the collection");
      return false;
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
            onClick={() =>
              setAddingProcess((prevState) => ({
                ...prevState,
                opened: true,
                type: "post",
              }))
            }
            aria-label="add"
            style={{ marginRight: 20 }}
          >
            <AddCircleOutlineOutlined color="success" />
          </IconButton>
          <IconButton
            onClick={() => setIsLogout(true)}
            aria-label="logout"
            style={{ marginRight: 20 }}
          >
            <LogoutOutlined />
          </IconButton>
        </div>
      </div>

      <Drawer
        open={addingProcess.opened}
        onClose={() => {
          setAddingProcess((prevState) => ({ ...prevState, opened: false }));
          setCollection({});
        }}
        anchor="right"
      >
        <Box
          sx={{
            width: "right" === "top" || "right" === "bottom" ? "auto" : 450,
            padding: 5,
          }}
          role="presentation"
        >
          <Typography variant="h3" gutterBottom>
            {addingProcess.type === "post"
              ? "New collection"
              : "Edit collection"}
          </Typography>
          <Stack spacing={1} direction="column">
            <TextField
              value={collection?.name || collection?.name || ""}
              onChange={(e) => {
                setCollection((prevState) => ({
                  ...prevState,
                  name: e.target.value,
                }));
              }}
              required
              id="outlined-size-small-title"
              label="Name"
              variant="outlined"
              fullWidth
              disabled={addingProcess.type === "update"}
            />
            <TextField
              value={collection?.description || ""}
              onChange={(e) =>
                setCollection((prevState) => ({
                  ...prevState,
                  description: e.target.value,
                }))
              }
              id="outlined-size-small-description"
              label="Description"
              variant="outlined"
              sx={{ width: "100%" }}
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

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Box sx={{ m: 2, position: "relative" }}>
              <Fab
                aria-label="save"
                color="primary"
                sx={{
                  ...(addingProcess.success && {
                    bgcolor: green[500],
                    "&:hover": {
                      bgcolor: green[700],
                    },
                  }),
                }}
                onClick={
                  addingProcess.type === "post"
                    ? () => handleAddNewCollection()
                    : () => handleEdit()
                }
              >
                {addingProcess.success ? (
                  <CheckCircleOutline />
                ) : (
                  <SaveAsOutlined />
                )}
              </Fab>
              {loading && (
                <CircularProgress
                  size={68}
                  sx={{
                    color: green[500],
                    position: "absolute",
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
        data.collectionsWithLocations.map(([name, item], i) => (
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
              <Typography>{name}</Typography>
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
                item.map((item, i) => (
                  <Collection
                    key={i + item.name}
                    name={item.name}
                    description={item.description}
                    onPress={() =>
                      navigate(`collection/${item.name}`, {
                        state: {
                          collectionName: item.name,
                          withLocation: true,
                          location: item.location,
                        },
                      })
                    }
                    image={
                      item.data && item.data.length > 0
                        ? item.data[0][0]
                        : preview
                    }
                    buttonList={[
                      {
                        text: "Edit",
                        onClick: () => {
                          setCollection({ ...item });
                          setEditCollection({ ...item });
                          setAddingProcess((prevState) => ({
                            ...prevState,
                            opened: true,
                            type: "update",
                          }));
                        },
                      },
                      {
                        text: "Remove",
                        onClick: () =>
                          setIsRemoving({
                            name: item.name,
                            location: item.location,
                            key: item.key,
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
              {data.collectionsWithoutLocations.map((item, i) => (
                <Collection
                  key={i}
                  name={item.name}
                  description={item.description}
                  onPress={() =>
                    navigate(`collection/${item.name}`, {
                      state: {
                        collectionName: item.name,
                        withLocation: false,
                      },
                    })
                  }
                  image={
                    item.data && item.data.length > 0
                      ? item.data[0][0]
                      : preview
                  }
                  buttonList={[
                    {
                      text: "Edit",
                      onClick: () => {
                        setCollection({ ...item });
                        setEditCollection({ ...item });
                        setAddingProcess((prevState) => ({
                          ...prevState,
                          opened: true,
                          type: "update",
                        }));
                      },
                    },
                    {
                      text: "Remove",
                      onClick: () =>
                        setIsRemoving({
                          name: item.name,
                          key: item.key,
                        }),
                      style: { color: "red" },
                    },
                  ]}
                />
              ))}
            </div>
          </div>
        )}

      <Dialog
        open={!!isRemoving}
        onClose={() => setIsRemoving(null)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Are you sure?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            If you press "Remove", it permanently delete "
            {isRemoving?.name ?? "selected"}" collection
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRemoving(null)}>Cancel</Button>
          <Button
            color="error"
            onClick={() =>
              handleRemove(isRemoving.name, isRemoving.location, isRemoving.key)
            }
            autoFocus
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isLogout}
        onClose={() => setIsLogout(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Are you sure?"}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setIsLogout(false)}>Cancel</Button>
          <Button color="error" onClick={handleSignOut} autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Home;
