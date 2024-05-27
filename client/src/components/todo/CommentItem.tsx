import React, {useState, useImperativeHandle} from 'react';
import { View, Text,TouchableOpacity,Keyboard,TouchableWithoutFeedback} from 'react-native';
import styles from '../../styles'
import CommentModal from '../modals/comment/CommentModal';
import { Comment } from '../../utils/interfaces/types';


interface CommentItemProps {
    item: Comment;
    todoId: string;
    projectId: string;
}

const CommentItem: React.FC<CommentItemProps> = ({ item, todoId, projectId}) => {

    const [isVisibleCommentModal, setIsVisibleCommentModal] = useState(false)
    const [commentModalMode, setCommentModalMode] = useState('')
    const toggleCommentModal = (mode:string) =>{
        setCommentModalMode(mode)
        setIsVisibleCommentModal(!isVisibleCommentModal);
    }

    return (
        <>
            <TouchableWithoutFeedback onPress={()=>Keyboard.dismiss()}>
                <TouchableOpacity onPress={()=>toggleCommentModal('view')}>
                    <View style={styles.viewTaskPage.main.comments.comment}>
                        <View style={styles.viewTaskPage.main.comments.comment.text}>
                            <Text numberOfLines={1} style={{lineHeight: 15}}>{item.commentText}</Text>
                        </View>
                        <CommentModal
                            isVisible={isVisibleCommentModal}
                            onClose={() => toggleCommentModal('')}
                            commentItem={item}
                            todoId={todoId}
                            projectId={projectId}
                            mode={commentModalMode}
                        /> 
                    </View>
                </TouchableOpacity>
            </TouchableWithoutFeedback>
        </>
    )
}
export default CommentItem;