import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import {RouteComponentProps} from "@reach/router";
import {AuthService} from "../machines/authMachine";
import {AnyState} from "xstate";
import {Box} from "@mui/material";
import SessionInfo from "../components/Session";
import Profile from "../components/Profile";
import Apps from "../components/Apps";
import {NotificationsService} from "../machines/notificationsMachine";
import ActionsContainer from "./ActionsContainer";
import MangeAccount from "../components/AccountManage";

const useStyles = makeStyles((theme) => ({
    box: {
        marginTop: theme.spacing(8),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    // paper: {
    //     marginTop: theme.spacing(8),
    //     display: "flex",
    //     flexDirection: "column",
    //     alignItems: "center",
    //     flexGrow: 1
    // },
    paper: {
        minHeight: "90vh",
        padding: theme.spacing(2),
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
        width: theme.spacing(12),
        height: theme.spacing(12),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    stack: {
        // width: "100%", // Fix IE 11 issue.
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: "row",
        margin: theme.spacing(2),
        justifyContent: "space-evenly"
    },
    stackItem: {
        flexShrink: 1  /* default 1 */
    }
}));


export interface ProfileProps extends RouteComponentProps {
    authService: AuthService;
    notificationsService: NotificationsService,


}

const profileSelector = (state: AnyState) => state?.context?.user;

function ProfileContainer({authService, notificationsService}: ProfileProps) {
    const classes = useStyles();


    return (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                flexDirection: "column",
                marginTop: "20px"
            }}
        >

            <div className={"shop-header " + classes.stackItem}>
                <div className="container">
                    <Profile authService={authService}/>
                </div>
            </div>
            <div  className={classes.stackItem}>
                <SessionInfo authService={authService}/>
            </div>
            <div className="store-sections">
                <div className="container">
                    <Apps authService={authService} notificationsService={notificationsService}/>
                </div>
            </div>
          
            <div className="shop-footer">
            <div >
               <MangeAccount authService={authService}/>
            </div>
            </div>
        </Box>
    );
}

export default ProfileContainer;
