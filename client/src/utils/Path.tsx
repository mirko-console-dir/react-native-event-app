//helpers to get path center and path center by index 
import {parse} from 'react-native-redash' // for parsing and manipulating paths.
/*
these functions provide a way to find the x-coordinate of the center point of SVG paths.
getPathXCenter(currentPath: string):

Takes an SVG path string (currentPath) as input.
Uses parse from react-native-redash to extract the curves information from the path.
Retrieves the start and end points of the path from the parsed curves.
Calculates the x-coordinate of the center point between the start and end points using the formula (startPoint.x * endPoint.x) / 2.
Returns the x-coordinate of the center point.

getPathXCenterByIndex(tabPaths: any[], index: number):

Takes an array of path strings (tabPaths) and an index (index) as input.
Retrieves the curves information from the SVG path at the specified index in the array.
Similar to the first function, it calculates the x-coordinate of the center point between the start and end points using the formula (startPoint.x * endPoint.x) / 2.
Returns the x-coordinate of the center point. */
export const getPathXCenter = (currentPath: string) => {
    const curves = parse(currentPath).curves;
    const startPoint = curves[0].to;
    const endPoint = curves[curves.length - 1].to;
    const centerX = (startPoint.x + endPoint.x) / 2;
    return centerX;
  };
export const getPathXCenterByIndex = (tabPaths: any[], index: number) => {
    const curves = tabPaths[index].curves;
    const startPoint = curves[0].to;
    const endPoint = curves[curves.length - 1].to;
    const centerX = (startPoint.x + endPoint.x) / 2;
    return centerX;
};