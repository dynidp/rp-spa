import * as React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import {useInterpret, useSelector} from "@xstate/react";
import {AnyInterpreter, AnyState} from "xstate";
import JsonView from "./JsonTreeViewer";
import {alpha, AppBar, Button, InputBase, ListSubheader, Paper, TextField, Toolbar, Typography} from "@mui/material";
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import {Client, DrService, Issuer} from '../machines/oidc-client/oidc_dr_machine';
import {AuthorizationRequestJson} from "@openid/appauth/built/authorization_request";
import {useEffect, useState} from 'react';
import {useAppLogger} from "../logger/useApplicationLogger";
import {NotificationsEvents} from "../machines/notificationsMachine";
import {DrActor} from "../machines/oidc-client/providers_machine";
import { Label } from '@mui/icons-material';

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
    form: {
        // width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(1),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
}));

export type DCRClient = { request: AuthorizationRequestJson, issuer: Issuer, client: Client };

export interface DCRProps {
    onChange: ({request, issuer, client}: DCRClient) => void;
    notify: (notification: NotificationsEvents) => {}
}

const clientSelector = (state: any) => state.context.client;
const issuerSelector = (state: any) => state.context.issuer;
const configSelector = (state: any) => state.context.config;
const errorSelector = (state: any) => state.context.error;
const nameSelector = (state: any) => state.context.name;


export interface DCRProviderProps {
    onChange: ({request, issuer, client}: DCRClient) => void;
    notify: (notification: NotificationsEvents) => {};
    drService: DrActor | DrService
}


export function Provider({onChange, notify, drService}: DCRProviderProps) {
    const classes = useStyles();
    useAppLogger(drService as AnyInterpreter | undefined, notify);

    const name = useSelector(drService, nameSelector);
    const client = useSelector(drService, clientSelector);
    const issuer = useSelector(drService, issuerSelector);
    const config = useSelector(drService, configSelector);
    const error = useSelector(drService, errorSelector);

    const [authRequest, setAuthRequest] = useState<AuthorizationRequestJson>({
        client_id: client?.client_id,
        scope: config?.scope || client?.scope,
        redirect_uri: config?.redirect_uri || client?.redirect_uris[0],
        response_type: 'code',
        state: 'dcr_web_client',
        extras: {'prompt': 'none', 'access_type': 'offline'}

    });

    const [value, setValue] = React.useState('op');

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    useEffect(() => {
        if (client) {

            // @ts-ignore
            setAuthRequest({
                ...authRequest,
                client_id: client?.client_id,
                scope: config?.scope || client?.scope,
                redirect_uri: config?.redirect_uri || client?.redirect_uris[0],


            });
        }
        return () => {
        };
    }, [client]);

    useEffect(() => {
        if (authRequest) {
            onChange({request: authRequest, issuer, client});
        }
        return () => {
        };
    }, [authRequest]);

    useEffect(() => {
        if (error) {
            setValue('error');
        }
        else if (authRequest) {
            setValue('request');
        }
        else  if (client) {
            setValue('client');
        }
       else if (issuer) {
            setValue('op');
        }
        
        
        return () => {
        };
    }, [error]);

    return (
        <div>
            <Typography color={"primary"} variant="h4" component="h2" mt={2}>
                {name}
            </Typography>
 
            <TabContext value={value}>

                <Paper>

                    <TabList onChange={handleChange} aria-label="Dynamic Registration Details">

                        <Tab label="OP Details" value="op"/>
                        <Tab label="Registered Client" value="client"/>
                        <Tab label="Authorization Request" value="request"/>
                        <Tab label="Error" value="error"/>

                    </TabList>

                </Paper>

                <TabPanel value="op">
                    {issuer && <JsonView data={issuer}/>}
                </TabPanel>
                <TabPanel value="client">
                    {client && <JsonView data={client}/>}

                </TabPanel>
                <TabPanel value="request">
                    {client && <JsonView data={authRequest}/>}</TabPanel>

                <TabPanel value="error">
                    {error && <JsonView data={error}/>}
                </TabPanel>
            </TabContext>
            <div className={classes.paper}>


            </div>

        </div>
    );
}

function decodeJwt(token?: string) {

    return token && token.split && JSON.parse(atob(token.split('.')[1]));

}



