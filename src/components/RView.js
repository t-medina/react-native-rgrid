import React from 'react';
import {View} from "react-native";
import * as PropTypes from "prop-types";
import Grid from "../Grid";


class RView extends React.Component {

    unsubscribe

    componentDidMount() {
        if (!Grid.isBuilt())
            throw new Error("RView can't be included without first including RGrid");

        this.unsubscribe = Grid.onDimensionsUpdated(() => this.forceUpdate());
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    render() {
        const { classes, style } = this.props;

        const responsiveClasses = classes ? (Array.isArray(classes) ? classes : classes.split(" ")) : [];
        const responsiveStyles  = responsiveClasses.length > 0 ? Grid.getActiveStyles(responsiveClasses) : [];

        const compoundStyles = responsiveStyles.concat(style);

        return (
            <View style={compoundStyles} children={this.props.children} />
        );
    }
}

RView.propTypes = {
    style: PropTypes.any,
    classes: PropTypes.oneOfType([PropTypes.string, PropTypes.array])
}

RView.defaultProps = {
    style: [],
    classes: []
};

export default RView;
