import React from 'react'

function CommentItem({ comment }) {
  console.log(comment);
  return (
    <div>
      <p>{comment.Contenido}</p>
      {comment.Foto && <img src={comment.Foto} alt="Imagen del comentario" />}
    </div>
  )
}

export default CommentItem;