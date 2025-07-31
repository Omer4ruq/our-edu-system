import React from "react";
import ReactDOM from "react-dom/client";
import Root from "./Root";
import "./index.css";
import { Provider } from 'react-redux';
import { store } from "./redux/store";




ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
     <div className="">
       <Root />
     </div>
    </Provider>
  </React.StrictMode>
);