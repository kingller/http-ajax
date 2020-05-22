import React from 'react';
import { Route, Router, Switch as RouterSwitch, Redirect, withRouter } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import _ from 'lodash';
import hashHistory from '../js/hash-history';
import Loadable from '../components/loading/loadable';

import AjaxExample from '../src/ajax/index';

const MainWithRouter = withRouter(
    class Main extends React.PureComponent<RouteComponentProps> {
        render() {
            const props = this.props;
            const module = 'module' + props.location.pathname.replace(/\//g, '-');
            return (
                <div className="layout-responsive-left-fixed page-container">
                    <Loadable name="$loading">
                        <div className="pdr-example-container">
                            <div className="page-content">
                                <div className={`page-body ${module}`}>
                                    <div className="module-wrapper">
                                        <div>
                                            <RouterSwitch>
                                                <Route key="ajax" path="/ajax" exact={true} component={AjaxExample} />
                                                <Redirect to="/ajax" />
                                            </RouterSwitch>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Loadable>
                </div>
            );
        }
    }
);

export default (
    <Router history={hashHistory}>
        <MainWithRouter />
    </Router>
);
