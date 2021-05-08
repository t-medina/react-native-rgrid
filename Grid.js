import '@expo/match-media'
import matchMedia from 'matchmediaquery';
import {Dimensions, StyleSheet} from "react-native";
import isEqual from "lodash.isequal";
import EventEmitter from 'eventemitter3';


const defaults = {
    columns: 12,
    gutterWidth: 24,
    breakpoints: {
        xs: 0,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
        xxl: 1400
    },
    containerMaxWidths: {
        xs: "100%",
        sm: 540,
        md: 720,
        lg: 960,
        xl: 1140,
        xxl: 1320
    }
};


const FluidClass = "container-fluid";
const RowClass = "row";
const NoActiveColumnClass = "no-column";
const DimensionsUpdated = "DimensionsUpdated";


const matchBreakpoints = (breakpoints) => ({
    xs: true,
    sm: matchMedia("(min-width: " + breakpoints.sm + "px)").matches,
    md: matchMedia("(min-width: " + breakpoints.md + "px)").matches,
    lg: matchMedia("(min-width: " + breakpoints.lg + "px)").matches,
    xl: matchMedia("(min-width: " + breakpoints.xl + "px)").matches,
    xxl: matchMedia("(min-width: " + breakpoints.xxl + "px)").matches,
})

const getBiggestActiveBreakpoint = (breakpoints) => {
    let biggestBreakpoint;

    for (const [breakpoint, active] of Object.entries(breakpoints)) {
        if (active)
            biggestBreakpoint = breakpoint;
        else
            break;
    }

    return biggestBreakpoint;
}

const buildClass = (name, breakpoint, style) => {
    return { name, breakpoint, style };
}


const buildRowClasses = (breakpoints, columns) => {
    const classes = {};
    classes[RowClass] = buildClass(RowClass, "xs", { display: "flex", flexDirection: "row", flexWrap: "wrap" })

    return classes;
}

const buildColumnsClasses = (breakpoints, columns, gutter) => {
    const classes = {};
    const commonStyles  = { paddingLeft: gutter / 2, paddingRight: gutter / 2 };

    Object.keys(breakpoints).forEach(breakpoint => {

        buildSizeColumnClasses(breakpoint);
        buildNoSizeColumnClasses(breakpoint);
        buildAutoWidthClasses(breakpoint);
        buildNoActiveColumnClasses();
    });


    function buildSizeColumnClasses(breakpoint) {
        for (let size = 1; size <= columns; size++)
        {
            const width = Math.round((size / columns * 100) * 100) / 100;
            const style = { width: width + "%", flex: 0, flexBasis: "auto", ...commonStyles };

            const name  = "col-" + (breakpoint === "xs" ? "" : breakpoint + "-") + size;
            classes[name] = buildClass(name, breakpoint, style);
        }
    }

    function buildNoSizeColumnClasses(breakpoint) {
        const name  = "col" + (breakpoint === "xs" ? "" : "-" + breakpoint);
        const style = { flex: 1, flexShrink: 0, ...commonStyles };

        classes[name] = buildClass(name, breakpoint, style);
    }

    function buildAutoWidthClasses(breakpoint) {
        const name  = "col" + (breakpoint === "xs" ? "" : "-" + breakpoint) + "-auto";
        const style = { width: "auto", flex: 0, flexBasis: "auto", ...commonStyles }

        classes[name] = buildClass(name, breakpoint, style);
    }

    function buildNoActiveColumnClasses() {
        const style = { width: "100%", flex: 0, flexBasis: "100%", ...commonStyles }

        classes[NoActiveColumnClass] = buildClass(NoActiveColumnClass, "xs", style);
    }

    return classes;
}

const buildContainersClasses = (breakpoints, containerMaxWidths) => {
    const classes = {};
    const commonStyles  = { marginLeft: "auto", marginRight: "auto" };

    classes[FluidClass] = buildClass(FluidClass, "xs", { width: "100%", ...commonStyles });

    Object.keys(breakpoints).forEach(breakpoint => {
        const name  = "container" + (breakpoint === "xs" ? "" : "-" + breakpoint);
        const style = { width: containerMaxWidths[breakpoint], ...commonStyles };

        classes[name] = buildClass(name, breakpoint, style);
    });

    return classes;
}


class GridDefinition {

    _isReady = false;
    _properties = {};
    _eventEmitter;
    _classes;
    _classesDefinition;
    _activeStyles = {};
    _activeBreakpoints = {};
    _biggestActiveBreakpoint;


    constructor() {
        this._eventEmitter = new EventEmitter();
    }

    build = (config = {}, callback = () => null) => {
        Object.assign(this._properties, defaults, config);

        Dimensions.addEventListener('change', (allDimensions) => {
            if (this._isReady)
                this._updateGrid();
        });

        const rowClasses        = buildRowClasses(this._properties.breakpoints, this._properties.columns);
        const columnsClasses    = buildColumnsClasses(this._properties.breakpoints, this._properties.columns, this._properties.gutterWidth);
        const containersClasses = buildContainersClasses(this._properties.breakpoints, this._properties.containerMaxWidths);

        this._classesDefinition = { ...rowClasses, ...columnsClasses, ...containersClasses };
        this._classes = StyleSheet.create(
            Object.keys(this._classesDefinition)
                  .reduce((ac, current) => ({...ac, [current]: this._classesDefinition[current].style}), {}));

        this._updateGrid();
        this._isReady = true;

        callback();
    }

    getActiveStyles = (classes) => {
        const validClasses = classes.filter(_class => this._classesDefinition[_class] !== undefined);

        const containerClass = validClasses.find(_class => _class.includes("container"));
        if (containerClass !== undefined)
            return this._getActiveContainerStyles(containerClass);

        const rowClass = validClasses.find(_class => _class.includes("row"));
        if (rowClass !== undefined)
            return this._getActiveRowStyles(rowClass);

        const columnClasses = validClasses.filter(_class => _class.includes("col"));
        if (columnClasses.length > 0)
            return this._getActiveColumnStyles(columnClasses);

        return [];
    }

    onDimensionsUpdated(listener) {
        this._eventEmitter.on(DimensionsUpdated, listener);
        return () => this._eventEmitter.off(DimensionsUpdated, listener);
    }


    _updateGrid = () => {
        const matchedBreakpoints = matchBreakpoints(this._properties.breakpoints);

        if (!isEqual(this._activeBreakpoints, matchedBreakpoints)) {
            this._activeBreakpoints = matchedBreakpoints;
            this._biggestActiveBreakpoint = getBiggestActiveBreakpoint(this._activeBreakpoints);
            this._activeStyles = this._getActiveStyles();

            if (this._isReady) {
                this._eventEmitter.emit(DimensionsUpdated);
            }
        }
    }

    _getActiveStyles = () => {
        return Object.values(this._classesDefinition)
                     .filter(({ breakpoint }) => this._activeBreakpoints[breakpoint] === true)
                     .reduce((ac, current) => ({...ac, [current.name]: this._classes[current.name]}), {});
    }

    _getActiveContainerStyles = (containerClass) => {
        if (containerClass === FluidClass || this._biggestActiveBreakpoint === "xs")
            return [ this._classes[FluidClass]];

        const containerBreakpoint = this._classesDefinition[containerClass].breakpoint;
        if (this._properties.breakpoints[containerBreakpoint] > this._properties.breakpoints[this._biggestActiveBreakpoint])
            return [ this._classes[FluidClass] ];

        return [ this._classes["container-" + this._biggestActiveBreakpoint]];
    }

    _getActiveRowStyles = () => {
        return [ this._classes[RowClass] ];
    }

    _getActiveColumnStyles = (columnClasses) => {
        columnClasses.sort((a, b) => {
            const aBreakpoint = this._classesDefinition[a].breakpoint;
            const bBreakpoint = this._classesDefinition[b].breakpoint;

            return this._properties.breakpoints[aBreakpoint] - this._properties.breakpoints[bBreakpoint];
        });

        const activeStyles = columnClasses.filter(responsiveClass => this._activeStyles[responsiveClass] !== undefined)
                                          .map(responsiveClass => this._activeStyles[responsiveClass]);

        return activeStyles.length > 0 ? activeStyles : [ this._classes[NoActiveColumnClass] ];
    }
}


const Grid = new GridDefinition();
export default Grid;
