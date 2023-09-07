import React from "react";
import { useParams } from "react-router-dom";

import { AdImage } from '../../components'
import {
  getSingleCollection,
  addFileToStorage,
  updateCollection,
  removeAd
} from "../../api";

const Category = () => {
  const { id } = useParams();

  const inputRef = React.useRef(null);
  const [collection, setCollection] = React.useState(null);
  const [newFile, setNewFile] = React.useState(null);

  React.useEffect(() => {
    handleCollection(id);
  }, [id]);

  const handleCollection = async (colName) => {
    const data = await getSingleCollection(colName);

    if (data) {
      setCollection({ ...data });
    }
  };

  const handleFileAdding = (e) => {
    if (e.target.files) {
      setNewFile(e.target.files[0]);
    }
  };

  const handleAddFile = async () => {
    if (newFile) {
      await addFileToStorage(id, newFile, (url, fileName) => {
        if (url) {
          updateCollection(id, {
            ...collection,
            data: collection?.data ? [...collection.data, [url, fileName]] : [[url, fileName]],
          });

          setCollection((prevState) => ({
            ...prevState,
            data: prevState.data ? [...prevState.data, [url, fileName]] : [[url, fileName]],
          }));
        }
      });

      setNewFile(null);
    } else {
      inputRef.current.click();
    }
  };

  const handleRemovingAd = async (fileName, index) => {
    const result = await removeAd(id, fileName)

    if (result) {
      const newData = collection.data.filter((_, i) => i !== index)

      updateCollection(id, {
        ...collection,
        data: [...newData]
      });

      setCollection(prevState => ({
        ...prevState,
        data: [...newData]
      }))
    }
  }

  if (!collection) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        flex: 1
      }}
    >
      <div style={{ display: 'flex', flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
        <div>
          <h1>{collection.name}</h1>
          <h3>{collection.description}</h3>
        </div>

        <div>
          <input
            type="file"
            onChange={handleFileAdding}
            ref={inputRef}
            style={{
              display: "none",
            }}
          />

          <button onClick={() => handleAddFile()}>
            {newFile ? `Upload: ${newFile.name}` : "Add file"}
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flex: 1,
          flexWrap: "wrap",
          marginLeft: 50,
          marginRight: 50,
          justifyContent: "center",
        }}
      >
        {collection &&
          collection.data &&
          collection.data.map((el, i) => (
            <AdImage key={i} image={el[0]} onRemove={() => handleRemovingAd(el[1], i)} />
          ))}
      </div>
    </div>
  );
};

export default Category;
