import React from 'react';
import {Text} from "react-native";
import renderer from 'react-test-renderer';
import Grid from "../../src/Grid";
import {RView} from "../../src";

const mockUnsubscribe = jest.fn();
const mockStyles = {
    "col-12": "style-col-12",
    "col-md-4": "style-col-md-4",
}
jest.mock('../../src/Grid', () => ({
    isBuilt: jest.fn(() => true),
    onDimensionsUpdated: jest.fn(() => mockUnsubscribe),
    getActiveStyles: jest.fn((classes) => {
        return classes.filter(_class => mockStyles[_class]).map(_class => mockStyles[_class]);
    })
}));


describe("RView component render:", () => {
    it("given an empty RView, the component renders successfully", () => {
        const rview = renderer.create(<RView />).toJSON();
        expect(rview).toMatchSnapshot();
    });

    it("given a RView with one child, the component renders successfully", () => {
        const rview = renderer.create(<RView><Text>Sample content</Text></RView>).toJSON();
        expect(rview).toMatchSnapshot();
    });
});


describe("RView Styles:", () => {
    it("given an empty style prop is passed, the component renders without styles", () => {
        const rview = renderer.create(<RView style={{}} />).toJSON();
        expect(rview).toMatchSnapshot();
    });

    it("given an object style prop is passed, the styles are propagated to the generated View", () => {
        const style = { backgroundColor: "#fff" };
        const rview = renderer.create(<RView style={style} />).toJSON();

        expect(rview).toMatchSnapshot();
    });

    it("given an array style prop is passed, the styles are propagated to the generated View", () => {
        const style = [{ backgroundColor: "#fff" }, { fontColor: "#000" }];
        const rview = renderer.create(<RView style={style} />).toJSON();

        expect(rview).toMatchSnapshot();
    });
});


describe("RView and Grid classes:", () => {
    beforeEach(() => {
        Grid.isBuilt = jest.fn(() => true);
        Grid.onDimensionsUpdated.mockClear();
    });

    it("given a RView without RGrid, the renders fails due to the Grid not being built", () => {
        Grid.isBuilt = jest.fn(() => false);
        expect(() => renderer.create(<RView />)).toThrow();
    });

    it("given a RView, the Grid onDimensionsUpdated function is called once", () => {
        renderer.create(<RView />);
        expect(Grid.onDimensionsUpdated).toHaveBeenCalledTimes(1);
    });

    it("given a mounted RView, the unsubscribe function is called once on unmount", () => {
        const rview = renderer.create(<RView />);
        rview.unmount();

        expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });

    it("given an empty classes prop is passed, the component renders without styles", () => {
        const rview = renderer.create(<RView classes="" />).toJSON();
        expect(rview).toMatchSnapshot();
    });

    it("given one valid String class, the component retrieves the responsive styles", () => {
        const rview = renderer.create(<RView classes="col-12" />).toJSON();
        expect(rview).toMatchSnapshot();
    });

    it("given a non valid String class, the component renders successfully", () => {
        const rview = renderer.create(<RView classes="invalid-class" />).toJSON();
        expect(rview).toMatchSnapshot();
    });

    it("given a combination of valid and invalid String classes, the component retrieves the responsive styles", () => {
        const rview = renderer.create(<RView classes="col-12 invalid-class col-md-4" />).toJSON();
        expect(rview).toMatchSnapshot();
    });

    it("given one valid String array class, the component retrieves the responsive styles", () => {
        const rview = renderer.create(<RView classes={["col-12"]} />).toJSON();
        expect(rview).toMatchSnapshot();
    });

    it("given a non valid String array class, the component renders successfully", () => {
        const rview = renderer.create(<RView classes={["invalid-class"]} />).toJSON();
        expect(rview).toMatchSnapshot();
    });

    it("given a combination of valid and invalid String array classes, the component retrieves the responsive styles", () => {
        const rview = renderer.create(<RView classes={["col-12", "invalid-class", "col-md-4"]} />).toJSON();
        expect(rview).toMatchSnapshot();
    });
});
