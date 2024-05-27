export interface UserLoggedIn {
    id: string,
    fullname: string,
    email: string,
    avatar: object,
    collaborators: Collaborator[]
}
export interface Owner {
    id: string;
    fullname: string;
}
export interface Project {
    id: string;
    title: string;
    owner: Owner;
    expireDate: string;
    status: string;
    collaborators: Collaborator[];
    todos: Todo[];
}
export interface Collaborator {
    id:string;
    fullname:string;
    email:string;
    avatar: object;
}
export interface Todo {
    id: string;
    content: string;
    expireDate: string;
    comments: Comment[]
    checkedStatus: boolean;
    images: ImageItem[];
    project: string;
}

export interface Comment {
    id: string;
    commentText: string;
    author: Owner
}
export interface ImageItem {
    imageName: string,
}
export interface Memo {
    id: string;
    title: string;
    content: string;
    owner: Owner
};
// redux slices
export interface MemoState {
    memos: Memo[];
}
export interface ProjectState {
    projects: Project[];
}
export interface UserLoggedInState {
    user: UserLoggedIn;
}