import React from 'react'

export default ({ image, item, onChange, onAdd, list }) => {
  return (
    <div
      style={{
        display: "flex",
        border: "1px solid black",
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 15,
        marginBottom: 10,
        justifyContent: "space-between",
        width: 500
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width: '100%',
          justifyContent: 'space-between'
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 10,
          }}
        >
          <img
            src={image}
            width={100}
            height={100}
            content="contain"
            alt="preview"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
          <input
            placeholder="The title of your collection. Required"
            value={item?.title ?? ''}
            onChange={(e) => onChange(prevState => ({ ...prevState, title: e.target.value }))}
            style={{ border: "1px solid red", marginBottom: 10, marginTop: 10 }}
            alt="The title of your collection. Required"
          />

          <input
            placeholder="The description of your collection"
            value={item?.description ?? ''}
            onChange={(e) => onChange(prevState => ({ ...prevState, description: e.target.value }))}
            style={{ marginBottom: 10 }}
          />

          <input
            placeholder="The API key of your collection. Needed for getting collection in your app. Required"
            value={item?.key ?? ''}
            onChange={(e) => onChange(prevState => ({ ...prevState, key: e.target.value }))}
            style={{ border: "1px solid red", marginBottom: 10 }}
          />

          <input
            list="browsers" name="myBrowser"
            placeholder="The location of your collection"
            value={item?.location ?? ''}
            onChange={(e) => onChange(prevState => ({ ...prevState, location: e.target.value }))}
            style={{ marginBottom: 10 }}
          />
          <datalist id="browsers">
            {list && list.length > 0 && list.map(el => <option key={el} value={el} />)}
          </datalist>
        </div>

        <div style={{ marginRight: 15, cursor: 'pointer' }} onClick={onAdd}>+</div>
      </div>
    </div>
  )
}