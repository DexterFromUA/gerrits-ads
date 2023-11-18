import React from "react";
import { useNavigate } from "react-router-dom";

import {
  addCollection,
  getCollections,
  getCollectionsWithLocations,
  getCollectionsWithoutLocations,
  signOutUser,
  removeCollection,
} from "../../services/fbService";
import preview from "../../images/preview.jpg";
import { Collection, CollectionWithInputs } from "../../components";

const Home = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem("gMail");
  const uid = localStorage.getItem("gUId");

  const [loading, setLoading] = React.useState(true);
  const [addingProcess, setAddingProcess] = React.useState(false);
  const [data, setData] = React.useState(null);
  const [collection, setCollection] = React.useState({});

  React.useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const user = localStorage.getItem("gUId");

    if (user) {
      const collectionsWithLocations = await getCollectionsWithLocations(user);
      const collectionsWithoutLocations = await getCollectionsWithoutLocations(
        user
      );

      const collectionMap = new Map();

      collectionsWithLocations
        .map((item) => Object.values(item))
        .flat(1)
        .forEach((el) => {
          if (collectionMap.has(el.location)) {
            const items = collectionMap.get(el.location)

            collectionMap.set(el.location, [...items, { ...el }])
          } else {
            collectionMap.set(el.location, [el])
          }
        });

      setData({
        collectionsWithLocations: [...Array.from(collectionMap)],
        collectionsWithoutLocations: [...collectionsWithoutLocations],
      });
      setLoading(false);
    } else {
      navigate("/login");
    }
  };

  const handleAddNewCollection = async () => {
    if (collection?.title && collection?.key) {
      const result = await addCollection(
        uid,
        collection.title,
        collection?.description ?? "",
        collection.key,
        collection?.location ?? null,
        null
      );

      if (result) {
        setData((prevState) => {
          if (collection.location) {
            return {
              ...prevState,
              collectionsWithLocations: [
                ...prevState.collectionsWithLocations,
                {
                  name: collection.title,
                  description: collection?.description ?? "",
                  key: collection.key,
                  location: collection.location,
                  dateAdded: new Date().toDateString(),
                },
              ],
            };
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
        setAddingProcess(false);
      }
    }
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
      setData((prevState) => {
        if (location) {
          return {
            ...prevState,
            collectionsWithLocations: [
              ...prevState.collectionsWithLocations.filter(
                ({ name }) => name !== collection
              ),
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
        LOADING...
      </div>
    );
  }

  return (
    <div
      style={{ display: "flex", alignItems: "center", flexDirection: "column" }}
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
          <h4>{user}</h4>
          <i>{uid}</i>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <h1>Ads Admin Panel</h1>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={() => setAddingProcess((prevState) => !prevState)}
            style={{ marginRight: 20 }}
          >
            {addingProcess ? "Adding in process.." : "Add Collection"}
          </button>
          <button onClick={handleSignOut} style={{ marginRight: 20 }}>
            Sign Out
          </button>
        </div>
      </div>

      {addingProcess && (
        <CollectionWithInputs
          image={preview}
          item={collection}
          onChange={setCollection}
          onAdd={handleAddNewCollection}
        />
      )}

      {data &&
        data.collectionsWithLocations &&
        data.collectionsWithLocations.length > 0 && data.collectionsWithLocations.map(([title, item], i) => <div key={i}
          style={{
            display: "flex",
            flex: 1,
            width: "90%",
            marginTop: 50,
            flexDirection: "column",
          }}
        >
          <h4>{title}</h4>
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {item && item.length > 0 ? item.map(
              ({ name, description, location, data }, i) => (
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
                      onClick: () => handleRemove(name, location),
                      style: { color: "red" },
                    },
                  ]}
                />
              )
            ) : <div>Empty collection</div>}
          </div>
        </div>)}

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
            <h4>Without location</h4>
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
                ({ name, description, data }, i) => (
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
                        onClick: () => handleRemove(name),
                        style: { color: "red" },
                      },
                    ]}
                  />
                )
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default Home;
