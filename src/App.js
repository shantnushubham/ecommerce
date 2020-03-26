import React, { Component } from 'react'
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import MainIndex from './components/main/index'
import configureStore from "./configureStore";

const store = configureStore();

class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <Router>
                    <React.Fragment>
                        <Switch>
                            <Route exact path='/' component={MainIndex} />
                        </Switch>
                    </React.Fragment>
                </Router>
            </Provider>
        )
    }
}

export default App;
