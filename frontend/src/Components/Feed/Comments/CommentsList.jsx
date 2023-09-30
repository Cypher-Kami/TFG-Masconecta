import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommentItem from './CommentItem';

function CommentsList({ postID }) {
    const [comments, setComments] = useState([]);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
      axios.get(`http://localhost:3001/publicacion/publicaciones/${postID}/comentarios`)
      .then(response => {
          const commentsResponse = response.data;
          setComments(commentsResponse);
      })
      .catch(error => {
          console.error('Error al obtener los comentarios:', error);
      });
    }, [postID]);

  return (
    <div>
      {showAll 
        ? comments.map(comment => <CommentItem key={comment.ID} comment={comment} />)
        : comments.slice(0, 20).map(comment => <CommentItem key={comment.ID} comment={comment} />)
      }
      {comments.length > 20 && !showAll && (
        <button onClick={() => setShowAll(true)}>
          Ver todos los comentarios
        </button>
      )}
    </div>
  )
}

export default CommentsList;