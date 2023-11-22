import React from 'react'
import { Card, CardActionArea, CardActions, CardContent, CardMedia, IconButton, Typography } from '@mui/material'
import { DeleteOutline, EditOutlined } from '@mui/icons-material'

export default ({ name, description, onPress, image, buttonList }) => {
  return (
    <Card sx={{ width: 345, marginLeft: 4, marginBottom: 2 }} elevation={4}>
      <CardActionArea onClick={onPress}>
        <CardMedia
          component="img"
          height="200"
          image={image}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions style={{ justifyContent: 'flex-end' }}>
        {buttonList && buttonList.length > 0 && buttonList.map(({ text, onClick }, i) => <IconButton key={i} onClick={onClick} aria-label={text}>
          {text === 'Remove' && <DeleteOutline color='error' />}
          {text === 'Edit' && <EditOutlined />}
        </IconButton>)}
      </CardActions>
    </Card>
  )
}