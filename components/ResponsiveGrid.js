import React from 'react';
import Grid from "../Grid";


class ResponsiveGrid extends React.Component {

    state = {
        gridReady: false
    }

    componentDidMount() {
        Grid.build({}, () => {
            this.setState({
                gridReady: true
            });
        });
    }

    render() {
        if (!this.state.gridReady)
            return null;

        return (
            <React.Fragment children={this.props.children} />
        );
    }
}

export default ResponsiveGrid;
