import '@expo/match-media'
import matchMedia from 'matchmediaquery';
import {Dimensions, StyleSheet} from "react-native";
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


let isReady = false;
let properties = {};
let eventEmitter;
let classes;
let classesDefinition;
let activeStyles = {};
let activeBreakpoints = {};
let biggestActiveBreakpoint;


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


const updateGrid = () => {
    const matchedBreakpoints = matchBreakpoints(properties.breakpoints);
    const breakpointsHaveChanged = JSON.stringify(activeBreakpoints) !== JSON.stringify(matchedBreakpoints)

    if (breakpointsHaveChanged) {
        activeBreakpoints = matchedBreakpoints;
        biggestActiveBreakpoint = getBiggestActiveBreakpoint(activeBreakpoints);
        activeStyles = updateActiveStyles();

        if (isReady) {
            eventEmitter.emit(DimensionsUpdated);
        }
    }
}

const updateActiveStyles = () => {
    return Object.values(classesDefinition)
        .filter(({ breakpoint }) => activeBreakpoints[breakpoint] === true)
        .reduce((ac, current) => ({...ac, [current.name]: classes[current.name]}), {});
}


const getActiveContainerStyles = (containerClass) => {
    if (containerClass === FluidClass || biggestActiveBreakpoint === "xs")
        return [ classes[FluidClass]];

    const containerBreakpoint = classesDefinition[containerClass].breakpoint;
    if (properties.breakpoints[containerBreakpoint] > properties.breakpoints[biggestActiveBreakpoint])
        return [ classes[FluidClass] ];

    return [ classes["container-" + biggestActiveBreakpoint]];
}

const getActiveRowStyles = () => {
    return [ classes[RowClass] ];
}

const getActiveColumnStyles = (columnClasses) => {
    columnClasses.sort((a, b) => {
        const aBreakpoint = classesDefinition[a].breakpoint;
        const bBreakpoint = classesDefinition[b].breakpoint;

        return properties.breakpoints[aBreakpoint] - properties.breakpoints[bBreakpoint];
    });

    const activeColumnStyles = columnClasses.filter(responsiveClass => activeStyles[responsiveClass] !== undefined)
        .map(responsiveClass => activeStyles[responsiveClass]);

    return activeColumnStyles.length > 0 ? activeColumnStyles : [ classes[NoActiveColumnClass] ];
}



const build = (config = {}) => {
    eventEmitter = new EventEmitter();

    Object.assign(properties, defaults, config);
    Dimensions.addEventListener('change', (allDimensions) => {
        if (isReady)
            updateGrid();
    });

    const rowClasses        = buildRowClasses(properties.breakpoints, properties.columns);
    const columnsClasses    = buildColumnsClasses(properties.breakpoints, properties.columns, properties.gutterWidth);
    const containersClasses = buildContainersClasses(properties.breakpoints, properties.containerMaxWidths);

    classesDefinition = { ...rowClasses, ...columnsClasses, ...containersClasses };
    classes = StyleSheet.create(
        Object.keys(classesDefinition)
            .reduce((ac, current) => ({...ac, [current]: classesDefinition[current].style}), {}));

    updateGrid();
    isReady = true;
}

const isBuilt = () => {
    return isReady;
}

const getActiveStyles = (classes) => {
    const validClasses = classes.filter(_class => classesDefinition[_class] !== undefined);

    const containerClass = validClasses.find(_class => _class.includes("container"));
    if (containerClass !== undefined)
        return getActiveContainerStyles(containerClass);

    const rowClass = validClasses.find(_class => _class.includes("row"));
    if (rowClass !== undefined)
        return getActiveRowStyles(rowClass);

    const columnClasses = validClasses.filter(_class => _class.includes("col"));
    if (columnClasses.length > 0)
        return getActiveColumnStyles(columnClasses);

    return [];
}

const onDimensionsUpdated = (listener) => {
    eventEmitter.on(DimensionsUpdated, listener);
    return () => eventEmitter.off(DimensionsUpdated, listener);
}

export default {
    build: build,
    isBuilt: isBuilt,
    getActiveStyles: getActiveStyles,
    onDimensionsUpdated: onDimensionsUpdated
};
