import { useMemo } from "react";
import { curveBasis, line } from "d3-shape";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../utils/constants/Screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {parse} from 'react-native-redash' 
import { Platform } from "react-native";

type GenerateTabShapePath = (
    position: number,
    adjustedHeight: number
) => string;

const NUM_TABS = 3;
const SCALE = 0.7;

const generateTabShapePath: GenerateTabShapePath = (position,adjustedHeight) => {

    const adjustedWidth = SCREEN_WIDTH / NUM_TABS;
    const tabX = adjustedWidth * position;

    const lineGenerator = line().curve(curveBasis)
    const tab = lineGenerator([
        [tabX - 100 * SCALE , 0],
        [tabX - (65 + 35) * SCALE , 0],
        [tabX - (50 - 10) * SCALE , -6 * SCALE],
        [tabX - (50 - 10) * SCALE , (adjustedHeight -14) * SCALE],
        [tabX + (50 - 10) * SCALE , (adjustedHeight -14) * SCALE],
        [tabX + (50 - 10) * SCALE , -6 * SCALE],
        [tabX + (65 + 35) * SCALE , 0],
        [tabX + 100 * SCALE , 0],
    ]);
    return `${tab}`
}
//helper to continue reading the custom tabs
const usePath = () =>{
    let TAB_BAR_HEIGHT = SCREEN_HEIGHT / 13;
    if(Platform.OS === "ios") TAB_BAR_HEIGHT = SCREEN_HEIGHT / 18

    const insets = useSafeAreaInsets()
    const tHeight = TAB_BAR_HEIGHT + insets.bottom
    const adjustedHeight = tHeight - insets.bottom

    const containerPath = useMemo(()=>{
        return `M0,0L${SCREEN_WIDTH},0L${SCREEN_WIDTH},0L${SCREEN_WIDTH},${tHeight}L0,${tHeight}L0,0`;
    },[tHeight]);

    const curvedPaths = useMemo(()=>{
        return Array.from({length: NUM_TABS}, (_,index)=>{
            const tabShapePath = generateTabShapePath(index + 0.5, adjustedHeight);
            return parse(`${tabShapePath}`)
        })
    }, [adjustedHeight])

    return {containerPath, curvedPaths, tHeight}
}
export default usePath;

