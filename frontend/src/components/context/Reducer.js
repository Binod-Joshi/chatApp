const reducer = (state, action) => {
    switch (action.type) {
      case "registered":
        return {
          isLoading: true,
          user: action.payload,
        };
        case "authRequest":
        return {
          isLoading: false,
        };
        case "registeredFailed":
        return {
          isLoading: true,
          response: action.payload,
        };
      case "login":
        return {
          isLoading: true,
          user: action.payload,
        };
      case "loginfailed":
        return {
          isLoading: true,
          error: action.payload,
        };
      case "logout":
        return {
          isLoading:true,
          user: action.payload,
        };
        case "delete":
          return {
            user: action.payload,
          };  
      case "update":
        return {
          user: action.payload,
        };
    //   case "posts":
    //     return {
    //       ...state,
    //       isLoading: false,
    //       totalposts: action.payload,
    //     };
      case "loading":
        return {
          ...state,
          isLoading: true,
        };
  
      default:
        return state;
    }
  };
  export default reducer;
  