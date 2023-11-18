import React from 'react'

import SettingButton from '../SettingButton'

export default ({ name, description, onPress, image, buttonList }) => {
  return (
    <div
      onClick={onPress}
      style={{
        display: "flex",
        border: "1px solid black",
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 15,
        marginBottom: 10,
        cursor: "pointer",
        justifyContent: "space-between",
        width: '30%',
        height: 130,
        marginLeft: 10,
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
            src={image}
            width={100}
            height={100}
            alt="preview"
            style={{
              objectFit: 'contain'
            }}
          />
        </div>

        <div>
          <h4>{name}</h4>

          <h6>{description}</h6>
        </div>
      </div>

      <SettingButton
        list={buttonList}
      />
    </div >
  )
}