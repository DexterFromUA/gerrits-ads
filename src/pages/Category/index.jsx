import React from "react";
import { useParams } from "react-router-dom";

import { getSingleCollection, addFileToStorage, updateCollection } from "../../api";

const MOCK = [
  {
    title: "first",
    description: "description",
    image:
      "https://cdn2.vectorstock.com/i/1000x1000/48/06/image-preview-icon-picture-placeholder-vector-31284806.jpg",
  },
  {
    title: "second",
    description: "description",
    image:
      "https://cdn2.vectorstock.com/i/1000x1000/48/06/image-preview-icon-picture-placeholder-vector-31284806.jpg",
  },
  {
    title: "third",
    description: "description",
    image:
      "https://cdn2.vectorstock.com/i/1000x1000/48/06/image-preview-icon-picture-placeholder-vector-31284806.jpg",
  },
];

const Category = () => {
  const { id } = useParams();

  const inputRef = React.useRef(null)
  const [collection, setCollection] = React.useState(null);
  const [newFile, setNewFile] = React.useState(null)

  React.useEffect(() => {
    handleCollection(id)
  }, [id])

  const handleCollection = async (colName) => {
    const data = await getSingleCollection(colName)

    if (data) {
      setCollection({ ...data })
    }
  }

  const handleFileAdding = (e) => {
    if (e.target.files) {
      setNewFile(e.target.files[0]);
    }
  }

  const handleAddFile = async () => {
    if (newFile) {
      await addFileToStorage(id, newFile, (url) => {
        if (url) {
          updateCollection(id, {
            ...collection,
            data: collection?.data ? [...collection.data, url] : [url]
          })

          setCollection(prevState => ({ ...prevState, data: prevState.data ? [...prevState.data, url] : [url] }))
        }
      })

      setNewFile(null)
    } else {
      inputRef.current.click()
    }
  }

  if (!collection) {
    return (
      <div>Loading...</div>
    )
  }

  return (
    <div
      style={{ display: "flex", alignItems: "center", flexDirection: "column" }}
    >
      <div>
        <h1>{collection.name}</h1>
      </div>

      <div>
        <h3>{collection.description}</h3>
      </div>

      {collection && collection.data && <div style={{ flex: 1, marginTop: 100, width: 500 }}>
        {collection.data.map((el, i) => (
          <div
            key={i}
            // onClick={() => {
            //   console.log("collection");
            // }}
            style={{
              display: "flex",
              border: "1px solid black",
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 15,
              marginBottom: 10,
              // cursor: "pointer",
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
                <img src={el} width={300} height={300} alt="preview" />
              </div>

              {/* <div>
                <h4>{el.title}</h4>

                <h6>{el.description}</h6>
              </div> */}
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
                cursor: "pointer",
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
      </div>}

      <input
        type='file'
        onChange={handleFileAdding}
        ref={inputRef}
        style={{
          display: "none",
        }}
      />

      <button onClick={() => handleAddFile()}>{newFile ? `Upload: ${newFile.name}` : 'Add file'}</button>
    </div>
  );
};

export default Category;
