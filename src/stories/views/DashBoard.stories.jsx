import React from 'react';
import Dashboard from '../../common/views/Dashboard';

export default {
    title: 'Views/Dashboard',
    argTypes: {
    }
}

const Component = (args) => {
    return <Dashboard />
};

export const Default = Component.bind({});
Default.args = {

};