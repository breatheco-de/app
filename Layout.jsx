import React from 'react'
import { BrowserRouter as Router,Switch,Route,Link} from "react-router-dom";
import Choose from './src/pages/Choose';

function Layout() {
    return (
        <Router>
            <div>
                <Switch>
                    <Route component={Choose} exact path="/choose" />
                </Switch>
            </div>
        </Router>
    )
}

export default Layout
