import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommentItem from './CommentItem';

function CommentsList({ postID, userID, comments, loadComments }) {
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
      loadComments();
    }, [postID, userID]);

  return (
    <div>
      {showAll 
        ? comments.map((comment, index) => <CommentItem key={comment.ID} 
        comment={comment} index={index} userID={userID}
        totalComments={comments.length} loadComments={loadComments} />)
        : comments.slice(0, 20).map((comment, index) => <CommentItem key={comment.ID} 
          comment={comment} index={index} totalComments={comments.length} userID={userID} 
          loadComments={loadComments} />)
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