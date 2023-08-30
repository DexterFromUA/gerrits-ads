import React from "react";
import { useNavigate } from "react-router-dom";

import { addCollection, getCollections } from "../../api";
import preview from '../../images/preview.jpg'

const Home = () => {
  const navigate = useNavigate();

  const [addingProcess, setAddingProcess] = React.useState(false)
  const [collectionName, setCollectionName] = React.useState('')
  const [collectionDescription, setCollectionDescription] = React.useState('')
  const [data, setData] = React.useState([])

  React.useEffect(() => {
    handleGetData();
  }, [])

  const handleGetData = async () => {
    const collections = await getCollections()

    setData([...collections])
  }

  const handleAddNewCollection = async () => {
    await addCollection(collectionName, collectionDescription)
    setData(prevState => [...prevState, {
      name: collectionName,
      description: collectionDescription,
      dateAdded: new Date().toDateString(),
    }])
    setAddingProcess(false)
  }

  return (
    <div
      style={{ display: "flex", alignItems: "center", flexDirection: "column" }}
    >
      <div>
        <h1>Darts admin</h1>
      </div>

      <div style={{ flex: 1, marginTop: 100, width: 500 }}>
        {data && data.map((el, i) => (
          <div
            key={i}
            onClick={() => navigate(`collection/${el.name}`, {
              state: {
                collection: el.name
              }
            })}
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
                <img src={preview} width={100} height={100} content='contain' alt="preview" />
              </div>

              <div>
                <h4>{el.name}</h4>

                <h6>{el.description}</h6>
              </div>
            </div>

            <div
              onClick={(e) => {
                e.stopPropagation();

                console.log("settings");
              }}
              style={{
                display: "flex",
                alignSelf: "flex-start",
                justifySelf: "flex-end",
                padding: 15,
              }}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/126/126472.png"
                width={20}
                height={20}
                alt="settings"
              />
            </div>
          </div>
        ))}
      </div>

      {!addingProcess && <div
        onClick={() => setAddingProcess(prevState => !prevState)}
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
      </div>}

      {addingProcess && <div>
        <input placeholder="Collection name" value={collectionName} onChange={(e) => setCollectionName(e.target.value)} />
        <input placeholder="Collection description" value={collectionDescription} onChange={(e) => setCollectionDescription(e.target.value)} />
        <button onClick={handleAddNewCollection}>add</button>
      </div>}
    </div>
  );
};

export default Home;
