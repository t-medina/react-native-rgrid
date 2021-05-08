import React from 'react';
import {View} from "react-native";
import * as PropTypes from "prop-types";
import Grid from "../Grid";


class ResponsiveView extends React.Component {

    unsubscribe;

    componentDidMount() {
        this.unsubscribe = Grid.onDimensionsUpdated(() => this.forceUpdate());
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    render() {
        const { classes, style } = this.props;

        const responsiveClasses = Array.isArray(classes) ? classes : classes.split(" ");
        const responsiveStyles  = Grid.getActiveStyles(responsiveClasses);

        const compoundStyles = responsiveStyles.concat(style);

        return (
            <View style={compoundStyles} children={this.props.children} />
        );
    }
}

ResponsiveView.propTypes = {
    style: PropTypes.any,
    classes: PropTypes.any
}

export default ResponsiveView;
