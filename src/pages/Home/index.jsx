import React from "react";
import { useNavigate } from "react-router-dom";

import { addCollection, getCollections, signOutUser, removeCollection } from "../../services/fbService";
import preview from '../../images/preview.jpg'
import { SettingButton } from "../../components";

const Home = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem("gMail");
  const uid = localStorage.getItem("gUId");

  const [loading, setLoading] = React.useState(true);
  const [addingProcess, setAddingProcess] = React.useState(false);
  const [collectionName, setCollectionName] = React.useState("");
  const [collectionDescription, setCollectionDescription] = React.useState("");
  const [collectionKey, setCollectionKey] = React.useState("");
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const user = localStorage.getItem("gUId");

    if (user) {
      const collections = await getCollections(user);

      setData([...collections]);
      setLoading(false);
    } else {
      navigate("/login");
    }
  };

  const handleAddNewCollection = async () => {
    if (collectionName && collectionKey) {
      const result = await addCollection(
        uid,
        collectionName,
        collectionDescription,
        collectionKey
      );

      if (result) {
        setData((prevState) => [
          ...prevState,
          {
            name: collectionName,
            description: collectionDescription,
            key: collectionKey,
            dateAdded: new Date().toDateString(),
          },
        ]);
        setCollectionName("");
        setCollectionDescription("");
        setCollectionKey("");
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

  const handleRemove = async (collection) => {
    const result = await removeCollection(uid, collection);

    if (result) {
      setData((prevState) => {
        if (prevState.length) {
          return prevState.filter(({ name }) => name !== collection);
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
          <h1>Ads admin</h1>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      </div>

      <div style={{ flex: 1, marginTop: 100, width: 500 }}>
        {data &&
          data.map((el, i) => (
            <div
              key={i}
              onClick={() =>
                navigate(`collection/${el.name}`, {
                  state: {
                    collection: el.name,
                  },
                })
              }
              style={{
                display: "flex",
                border: "1px solid black",
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 15,
                marginBottom: 10,
                cursor: "pointer",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    marginRight: 50,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 10,
                  }}
                >
                  <img
                    src={preview}
                    width={100}
                    height={100}
                    content="contain"
                    alt="preview"
                  />
                </div>

                <div>
                  <h4>{el.name}</h4>

                  <h6>{el.description}</h6>
                </div>
              </div>

              <SettingButton
                list={[
                  { text: "Edit", onClick: handleEdit },
                  {
                    text: "Remove",
                    onClick: () => handleRemove(el.name),
                    style: { color: "red" },
                  },
                ]}
              />
            </div>
          ))}
      </div>

      {!addingProcess && (
        <div
          onClick={() => setAddingProcess((prevState) => !prevState)}
          style={{
            cursor: "pointer",
            display: "flex",
            alignSelf: "center",
            justifySelf: "center",
            width: "auto",
            border: "1px solid green",
            padding: 10,
            borderRadius: 10,
          }}
        >
          Add new Collection
        </div>
      )}

      {addingProcess && (
        <div>
          <input
            placeholder="Collection name"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
          />
          <input
            placeholder="Collection description"
            value={collectionDescription}
            onChange={(e) => setCollectionDescription(e.target.value)}
          />
          <input
            placeholder="Collection Key"
            value={collectionKey}
            onChange={(e) => setCollectionKey(e.target.value)}
          />
          <button onClick={handleAddNewCollection}>add</button>
        </div>
      )}
    </div>
  );
};

export default Home;
