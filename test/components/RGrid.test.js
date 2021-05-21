import React from "react";
import renderer from "react-test-renderer";
import { RGrid, RView } from "../../src";
import Grid from "../../src/Grid";
import { Text } from "react-native";

jest.mock("../../src/Grid", () => ({
  build: jest.fn()
}));

describe("RGrid:", () => {
  it("given an RGrid, the Grid constructor is called once", () => {
    renderer.create(<RGrid />);
    expect(Grid.build).toHaveBeenCalledTimes(1);
  });

  it("given an empty RGrid, the component renders successfully", () => {
    const rview = renderer.create(<RGrid />).toJSON();
    expect(rview).toMatchSnapshot();
  });

  it("given a RGrid with one child, the component renders successfully", () => {
    const rview = renderer
      .create(
        <RGrid>
          <Text>Sample content</Text>
        </RGrid>
      )
      .toJSON();
    expect(rview).toMatchSnapshot();
  });
});
