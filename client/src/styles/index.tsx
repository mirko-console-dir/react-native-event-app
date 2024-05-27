import { StyleSheet, Platform, ImageBackground } from 'react-native';

const styles: any = StyleSheet.create({   
    mainTextColor: {
        color: '#A6446C'
    },
    textInput: {
      color: 'black',
      fontSize: 18,
      width: '100%',
    },
    button: {
      backgroundColor: '#e33062',
      height: 50,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 30,
    },
    buttonText: {
      color: 'black',
      fontSize: 18,
      fontWeight: 'bold',
    },
    errorText: {
      color: 'red',
      fontSize: 16,
      marginTop: 20,
    },
    input:{
      color: 'black',
      fontSize: 18,
      width: '100%',
      height: 50,
      marginVertical: 15,
      borderRadius: 10,
      borderWidth: 0.3,
      padding:10
    },
    passInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      position: 'absolute',
      right: 10,
    },
    container: {
        marginHorizontal: 15,
    },
    droidSafeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 35 : 0,
    },
    flexRowAllCenter: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    extraSpaceForScrollView: {
        height: 100 // this is to compensate the navbar space
    },
    extraSpaceForListItem: {
        height: 60 // this is to compensate the plusbutton space
    },
    h1: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    h2: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    h3: {
        fontSize: 15,
        fontWeight: '500'
    },
    textCenter: {
        textAlign: 'center'
    },
    pageContent: {
        minHeight: '100%',
    },
    home: {
        width: '100%',
        header: {
            height: 50,
        },
        banner: {
            marginBottom: 20,
            marginTop: 10, 
            width: '100%',
            borderRadius: 25,
            overflow: 'hidden',
            content: {
                paddingHorizontal: 25,
                paddingVertical: 40
            },
            button: {
                backgroundColor: '#e33062',
                height: 40,
                width: 150,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 20,
                text: {
                    fontWeight: 'bold'
                }
            },
            image: {
                width: 310,
                height: 310,
                position: 'absolute',
                right: -90,
                top: -25,
            }
        },
        main: {
            marginTop: 10,
            mainTop: {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'flex-start',
                boxContentHigher: {
                    width: 150,
                    height: 200,
                    backgroundColor: '#E2DCDC',
                    borderRadius: 25,
                    content: {
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        image: {
                            width: 80,
                            height: 100,
                            marginBottom: 10,
                            marginRight: -5
                        }
                    }
                },
                boxContentShorter: {
                    width: 150,
                    height: 110,
                    backgroundColor: '#E2DCDC',
                    borderRadius: 25,
                    content: {
                        display: 'flex',
                        flexDirection: 'row',
                        image: {
                            width: 20,
                            height: 20,
                        }
                    }
                }
            },
            mainBottom: {
                marginTop: -60,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'flex-end',
                boxContentHigher: {
                    width: 150,
                    height: 200,
                    backgroundColor: '#E2DCDC',
                    borderRadius: 25,
                    content: {
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        image: {
                            width: 80,
                            height: 100,
                            marginBottom: 10
                        }
                    }
                },
                boxContentShorter: {
                    width: 150,
                    height: 110,
                    backgroundColor: '#E2DCDC',
                    borderRadius: 25,
                    content: {
                        display: 'flex',
                        flexDirection: 'row',
                        image: {
                            width: 20,
                            height: 20,
                        }
                    }
                }
            },
        }

    },
    calendarProjectsPage: {
        flex: 1,
        header: {
            legend: {
                width: '100%',
                flexDirection: 'row',
                gap: 5,
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: 10,
                labelProject: {},
                dotProject: {
                    position: 'relative',
                    bottom: 5,
                    fontWeight: 'bold', 
                    fontSize: 20
                },
                labelTask: {},
                dotTask: {
                    position: 'relative',
                    bottom: 5,
                    fontWeight: 'bold', 
                    fontSize: 20,
                    opacity: 0.5
                },
            }
        },
        main: {
            marginTop: 5,
            titleSection: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginLeft: 15,
                marginBottom: 15,
            },
        },
    },
    projectsList: {
        marginBottom: 15
    },
    projectItem: {
        borderRadius: 10,
        overflow: 'hidden',
        marginLeft: 5,
        container: {
            paddingHorizontal: 20,
            paddingVertical: 15,
        },
        content: {
            header: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                title: {
                    flex: 1,
                },
                moreIcon:{
                    marginTop: -20,
                    marginRight: -20,
                    padding: 20,
                }
            },
            main: {
                collaboratorsSection: {
                    height: 30,
                    marginBottom: 15,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                    overflow: 'hidden',
                    container: {
                        flexDirection: 'row',
                    }
                }
            },
            footer: {
                statusBarNumber: {
                    textAlign: 'center',
                    marginVertical: 5
                },
                projectStatusBar: {
                    backgroundColor: 'rgba(255, 255, 255, 0.35)',
                    borderRadius: 10,
                    overflow: 'hidden',
                },
                completeStatusColor: {
                    backgroundColor: '#F05F9C',
                    height: 15,
                },
            }
        }
    },
    todoItemList: {
        flexGrow: 1,
        marginHorizontal: 5,
    },
    todoItem: {
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 5,
        container: {
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'space-between',
        },
        eventDetails: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            content: {
                alignSelf: 'center',
                marginRight: 'auto',
                marginTop: -5,
                marginBottom: 15,
                marginLeft: 15,

            },
            moreIcon: {
                paddingHorizontal: 13,
                paddingVertical: 5,
            }
        },
        main: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            content: {
                flex:1,
                alignSelf: 'center',
                marginRight: 'auto',
            },
        },
        footer: {
            alignSelf: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 10,
            paddingBottom: 15
        },
        actionButtons: {
            overflow: 'hidden',
            flexDirection: 'row',
            position: 'absolute',
            height: '90%',
            borderRadius: 10,
            zIndex: -1,
            btn: {
                height: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
            }
        }
       
    },
    viewTodayTasksPage: {
        flex: 1,
        header: {
            legend: {
                width: '100%',
                flexDirection: 'row',
                gap: 5,
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: 10,
                labelProject: {},
                dotProject: {
                    position: 'relative',
                    bottom: 5,
                    fontWeight: 'bold', 
                    fontSize: 20
                },
                labelTask: {},
                dotTask: {
                    position: 'relative',
                    bottom: 5,
                    fontWeight: 'bold', 
                    fontSize: 20,
                    opacity: 0.5
                },
            },
        },
        main: {
            flex: 1,
            marginTop: 5,
            titleSection: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginLeft: 15,
                marginBottom: 15,
            },
            todoItemList: {
                marginBottom: 15,
                paddingHorizontal: 5,
            }
        },
    },
    viewMemosPage: {
        paddingTop: 15,
        flex:1,
        main: {
            height: '83%',
            memosList: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                memoItem: {
                    width: '49%',
                    padding: 10,
                    borderRadius: 10,
                    borderWidth: 0.3,
                    marginBottom: 10,
                    content: {
                        header: {
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            moreIcon: {
                                paddingLeft: 20,
                            }
                        },
                        body: {
                            marginTop: 10
                        }
                    }
                }
            },
        },
    },
    createProjectPage: {
        width: '100%',
        main: {
            height: '100%',
            form: {
                width: '100%',
                marginTop: 15,
                inputContainer: {
                    flexDirection: 'column',
                    input: {
                        width: '100%',
                    },
                    inputTitle: {
                        fontSize: 18,
                        marginBottom: 20,
                        marginHorizontal: 15,
                    },
                    labelDate: {
                        fontSize: 18,
                        textTransform: 'capitalize',
                    },
                },
                labelDate: {
                },
                dateInputContainer: {
                    width: '100%',
                },
            },
        }
    },
    editProjectPage: {
        width: '100%',
        main: {
            height: '100%',
            form: {
                marginTop: 15,
                width: '100%',
                inputContainer: {
                    flexDirection: 'row',
                    input: {
                        width: '100%',
                    },
                    inputTitle: {
                        fontSize: 18,
                        marginBottom: 20,
                        marginHorizontal: 15,
                    },
                    labelDate: {
                        fontSize: 18,
                        textTransform: 'capitalize',
                    },
                },
                labelDate: {
                },
                dateInputContainer: {
                    width: '100%',
                },
            },
        }
    },
    viewProjectPage: {
        flex: 1,
        header: {
            marginTop: 5,
            flexDirection: 'row',
            justifyContent: 'space-between',
            collaboratorsArea: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                avatarsArea: {
                    flexDirection: 'row',
                    marginLeft: 10,
                }
            },
            projectViewActions:{
                marginRight: 10,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                areaAction: {
                    paddingHorizontal: 10,
                }
            },
            title: {
                marginTop: 10,
            }
        },
        main: {
            dateContainer: {
                width: '100%',
            },
        },
    },
    viewTaskPage: {
        flex: 1,
        container: {
        flex: 1,
        },
        header: {
            actions:{
                areaAction: {
                    paddingHorizontal: 20,
                    alignSelf: 'flex-end'
                }
            },
            dateContainer: {
                width: '100%',
            },
        },
        main: {
            details: {
                overflow: 'hidden',
                marginVertical: 10,
                images: {
                    tinyLogo: {
                        borderWidth: 0.3,
                        width: 60,
                        height: 60,
                    }
                },
            },
            comments: {
                flexGrow: 1,
                comment: {
                    flexDirection: 'row',
                    marginTop: 5,
                    text: {
                        height: '100%',
                        width: '100%',
                        borderRadius: 5,
                        paddingVertical: 5,
                        paddingHorizontal: 3,
                        borderWidth: 0.2,
                    }
                }
            }
        },
    },
    createMemoPage: {
        paddingHorizontal: 10,
        main: {
            form: {
                paddingTop: 15,
                inputContainer: {
                    minWidth: '100%',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    input: {
                        width: '100%',
                    },
                    inputTitle: {
                        fontSize: 18,
                        marginBottom: 20
                    },
                    inputBigContent: {
                        fontSize: 15,
                        textAlignVertical: 'top'
                    },
                },
                labelDate: {
                    textTransform: 'capitalize',
                },
                dateInputContainer: {
                    width: '100%',
                },
          

            },
        }
    },
    createTodoPage: {
        height: '100%',
        main: {
            form: {
                paddingHorizontal: 10,
                labelTitle: {
                    textTransform: 'capitalize',
                },
                inputContainer: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 15,
                    input: {
                        width: '100%',
                        paddingRight: 35,
                    },
                    inputContent: {
                        fontSize: 18,
                        textAlignVertical: 'top'
                    },
                    addImageContainer: {
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        iconAddImage: {
                            padding: 5,
                        }
                    },
                },
                imagesContainer: {
                    flexDirection: 'row',
                    gap: 15,
                    marginTop: 10,
                    removeBtn: {
                        backgroundColor: 'white',
                        borderRadius: 50,
                        position: 'absolute',
                        top: -10,
                        right: -10
                    }
                },
                labelDate: {
                    textTransform: 'capitalize',
                },
                dateInputContainer: {
                    width: '100%',
                    legend: {
                        width: '100%',
                        flexDirection: 'row',
                        gap: 5,
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        labelProject: {},
                        dotProject: {
                            marginBottom: 10,
                            fontWeight: 'bold', 
                            fontSize: 20
                        },
                    }
                },
           
            },
        }
    },
    editTodoPage: {
        height: '100%',
        main: {
            form: {
                labelTitle: {
                    textTransform: 'capitalize',
                },
                inputContainer: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 15,
                    input: {
                        width: '100%',
                        paddingRight: 35,
                    },
                    inputContent: {
                        fontSize: 18,
                        textAlignVertical: 'top'
                    },
                    addImageContainer: {
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        iconAddImage: {
                            padding: 5,
                        }
                    },
                },
                imagesContainer: {
                    flexDirection: 'row',
                    gap: 15,
                    marginTop: 10,
                    removeBtn: {
                        backgroundColor: 'white',
                        borderRadius: 50,
                        position: 'absolute',
                        top: -10,
                        right: -10
                    }
                },
                labelDate: {
                    textTransform: 'capitalize',
                },
                dateInputContainer: {
                    width: '100%',
                    legend: {
                        width: '100%',
                        flexDirection: 'row',
                        gap: 5,
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        labelProject: {},
                        dotProject: {
                            marginBottom: 10,
                            fontWeight: 'bold', 
                            fontSize: 20
                        },
                        labelTask: {},
                        dotTask: {
                            position: 'relative',
                            bottom: 5,
                            fontWeight: 'bold', 
                            fontSize: 20,
                            opacity: 0.5
                        },
                    }
                },
           
            },
        }
    },
    statsProjectsPage: {
        flex: 1,
        header: {
            statsGraph: {
                container: {
                    marginTop: 30,
                    height: 100,
                    flexDirection: 'row',
                    justifyContent: 'space-around', 
                    status: {
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                    }
                },
                tower: {
                    width: 25,
                    alignSelf: 'center',
                    borderRadius: 5
                },
                towerProgress: {
                    backgroundColor: 'orange',
                },
                towerUpcoming: {
                    backgroundColor: 'purple'
                },
                towerCompleted: {
                    backgroundColor: 'green'
                },
            },
            btnsFilter:{
                marginTop: 20,
                marginBottom: 10,
                container: {
                    height: 40,
                    flexDirection: 'row',
                    justifyContent: 'space-between', 
                    btn: {
                        borderRadius: 20,
                        width: '49%',
                        borderWidth: 0.3,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }
                }
            }
        },
        main: {
            flex: 1,
            marginTop: 5,
            titleSection: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginLeft: 15,
                marginBottom: 15,
            },
        },
    },
    profilePage: {
        flex: 1,
        container: {
            flex:1,
            marginHorizontal: 15,
        },
        header: {
            borderRadius:20,
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 10,
            avatarArea: {
                borderRadius: 100,
                padding: 5,
                borderWidth: 2,
                borderColor: 'black',
                alignSelf: 'center',
            },
            name: {
                alignSelf: 'center',
                text: {
                    color: 'black'
                }
            },
            editProfileBtn: {
                marginRight: 'auto',
                marginLeft: 'auto',
            }
        },
        main: {
            flex:1,
            marginBottom: 100, // navbar + icon height
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 20,
            listBtn: {
                padding: 10,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: 'black',
            },
        }
    },
    editProfilePage: {
        flex: 1,
        container: {
            flex:1,
            marginHorizontal: 15,
        },
        header: {
            borderRadius:20,
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 10,
            avatarArea: {
                borderRadius: 100,
                padding: 5,
                borderWidth: 2,
                borderColor: 'black',
                alignSelf: 'center',
                editAvatarBtn:{
                    borderRadius:100,
                    backgroundColor: 'white',
                    position: 'absolute',
                    bottom: -4,
                    right: 0,
                    padding: 5,
                    borderWidth: 2,
                    borderColor: 'black',
                }
            },
            name: {
                alignSelf: 'center',
                text: {
                    color: 'black'
                }
            },
            editProfileBtn: {
                marginRight: 'auto',
                marginLeft: 'auto',
            }
        },
        main: {
            flex:1,
            flexDirection: 'column',
        }
    },
    profileCollaboratorsPage: {
        flex: 1,
        container: {
            flex:1,
            marginHorizontal: 15,
        },
        main: {
            flex:1,
            flexDirection: 'column',
        }
    },
});
  
export default styles;