import React from "react";
import Grid from "../Grid";
import * as PropTypes from "prop-types";


class RGrid extends React.Component {

	state = {
		gridReady: false
	};

	componentDidMount() {
		Grid.build();
		this.setState({
			gridReady: true
		});
	}

	render() {
		if (!this.state.gridReady)
			return null;

		return (
			<React.Fragment>
				{ this.props.children }
			</React.Fragment>
		);
	}
}

RGrid.propTypes = {
	children: PropTypes.node
};

export default RGrid;
