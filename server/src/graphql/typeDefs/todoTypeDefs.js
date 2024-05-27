// type definition of the schema we gonna use in graphql query, mutations all we want to do
import { gql } from 'graphql-tag'
export default gql`    
    scalar Upload
    type Query {
        hello: String!
        getTodo(ID: ID!): Todo!
        getTodos(page: Int, pageSize: Int): TodoPagination!
        getTodoImages(todoId: ID!): [Url!]!  
    }
    type Mutation { 
        createTodo(input: CreateTodoInput!): Todo!
        deleteTodo(ID: ID): Boolean # indicate the func return a boolean
        editTodo(todoId: ID!, input: EditTodoInput!): Boolean!
        checkedStatusTodo(todoId: ID!, input: CheckedStatusTodoInput!): Boolean!
        addCommentTodo(todoId: ID!, input: AddCommentTodoInput!): Comment!
        deleteCommentTodo(todoId: ID!, commentId: ID!): Boolean!
        editCommentTodo(todoId: ID!, commentId: ID!, input: EditCommentTodoInput!): Boolean!
        deleteTaskImage(todoId: ID!, imageId: ID!, imageName: String!) : Boolean!
    }
    type Comment {
        id: ID
        commentText: String!
        author: User!
        createdAt: String
        updatedAt: String 
    }
    input AddCommentTodoInput {
        commentText: String!
    }
    type Todo {
        id: ID
        content: String!
        expireDate: String!
        comments: [Comment]
        images: [Image]    # Add the 'images' field here
        checkedStatus: Boolean!
        project: ID!
        createdAt: String
        updatedAt: String
    }
    type TodoPagination {
        todos: [Todo]
        totalItems: Int
        totalPages: Int
    }
    type Image {
        id: ID
        caption: String
        imageName: String
        createdAt: String
        updatedAt: String
    }
    type Url {
        id: ID
        imageName: String
        url: String
    }
    input CreateTodoInput {
        content: String!
        expireDate: String!
        projectId: ID!
        images: [Upload] # Update the type to Upload
        checkedStatus: Boolean
    }
    input EditTodoInput {
        content: String
        expireDate: String
        images: [Upload]
    }
    input CheckedStatusTodoInput {
        checkedStatus: Boolean
    }
    input EditCommentTodoInput {
        commentText: String
    }
    type Subscription {
        taskCreated: TaskSubscriptionPayload
        taskDeleted: TaskStatusSubscriptionPayload
        taskCheckedStatus: TaskStatusSubscriptionPayload
        commentCreated: CommentSubscriptionPayload
        commentUpdated: CommentSubscriptionPayload
        commentDeleted: CommentDeletedSubscriptionPayload
    }
    type TaskSubscriptionPayload {
        todo: Todo 
    }
    type TaskStatusSubscriptionPayload {
        projectId: ID
        todoId: ID
    }
    type CommentSubscriptionPayload {
        comment: Comment 
        projectId: ID
        todoId: ID
    }
    type CommentDeletedSubscriptionPayload {
        commentId: ID 
        projectId: ID
        todoId: ID
    }
 
`;
  