import React, {useEffect, useState} from 'react';
import {useMachine, useSelector} from '@xstate/react';
import {
    OP,
    ProviderService,
    providersMachine,
    providersMachineWithDefaults
} from '../machines/oidc-client/providers_machine';
import {
    alpha,
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    InputBase,
    Collapse,
    ListSubheader,
    ListItemButton,
    ListItemIcon,
    Icon,
    Button,
    Paper
} from '@mui/material';
import {DCRProps, Provider} from "./DCR";
import {useAppLogger} from "../logger/useApplicationLogger";
import {AnyInterpreter} from 'xstate';
import {useInterpretWithLocalStorage} from "../machines/withLocalStorage";
import {useInterpret} from "@xstate/react";
import {styled} from '@mui/styles';

import WebIcon from '@mui/icons-material/Web';
import {useForm} from 'react-hook-form';
import {AnyRecord} from "../models";


const Search = styled('div')(({theme}) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const IconWrapper = styled('div')(({theme}) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(TextField)(({theme}) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
}));

const providerSelector = (state: any) => state.context.provider;
const providerNameSelector = (state: any) => state.context.provider?.name;
const providersSelector = (state: any) => state.context.providers;

export const ProviderSelector = (props: DCRProps) => {
    const service = useInterpret(() => providersMachineWithDefaults);
    const provider = useSelector(service, providerSelector);
    const providerName = useSelector(service, providerNameSelector);
    const allProviders = useSelector(service, providersSelector);
    const {send} = service;
    useAppLogger(service as AnyInterpreter | undefined, props.notify);

    useEffect(() => {

    })
    const onChange = (e: any) => {
        send({type: 'SELECT', ...allProviders[e.target.value]});
        e.preventDefault();

    }


    return (
        <main>


            <Box sx={{minWidth: 120}}>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Provider</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={providerName}
                        label="Provider"
                        onChange={onChange}
                    >
                        {Object.keys(allProviders).map((provider) => {
                            return <MenuItem key={provider} value={provider}>{allProviders[provider].name}</MenuItem>;
                        })}
                        <AddProvider service={service}/>
                    </Select>
                </FormControl>
                {/*<AddProvider service={service}/>*/}
            </Box>

            <Paper>
                <h1>{!provider && 'Please select a provider'}</h1>

                <AddProvider service={service}/>
                {provider?.machine &&
                    <Provider {...props} drService={provider.machine}/>
                }

            </Paper>
        </main>
    );
}

const defaultsSelector = (state: any) => state.context.default_config;

export const AddProvider = ({service}: { service: ProviderService }) => {
    const redirect_uri = `${window.location.origin}/callback/gigya-login.html`
    const scope = "openid gigya_web";

    const defaults = {
        client_name: "default-static-js-client-spa",
        redirect_uris: [redirect_uri],
        token_endpoint_auth_method: 'none',
        "grant_types": ["authorization_code"],
        "response_types": ["code token idToken"],
        "scope": scope,

    }


    const [open, setOpen] = React.useState(false);
    const default_config = useSelector(service, defaultsSelector);

    const handleClick = () => {
        setOpen(!open);
    };

    const addIssuer = (data: AnyRecord) => {
        service.send({
            type: 'SELECT',
            ...data
        });
    }


    const {register, setValue, watch, handleSubmit, formState: {errors}} = useForm({
        defaultValues: {
            config: default_config,
            authority: undefined as string | undefined,
            name: undefined as string | undefined,
            info: undefined as string | undefined,

        }
    });
    const watchAuthority = watch("authority"); // you can supply default value as second argument
    const watchName = watch("name"); // you can supply default value as second argument

    React.useEffect(() => {
        if (watchAuthority && isValidUrl(watchAuthority)) {
            setOpen(true)
            if (!watchName)
                setValue('name', new URL(watchAuthority).hostname, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true
                });

        }
    }, [watchAuthority]);

    return (
        <div>

            <form onSubmit={handleSubmit(addIssuer)}>
                <div className="navbar-brand">

                    <TextField
                        inputProps={{'aria-label': 'authority'}}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="authority"
                        label="Authority"
                        autoComplete="issuer"
                        autoFocus
                        placeholder="add issuer…"
                        helperText={"Insert a valid URL"}
                        {...register("authority", {required: true, validate: isValidUrl})}
                    />

                    {errors && errors.authority && <span> {errors.authority.message}</span>}

                    <Button type="submit">
                        <IconWrapper>
                            <Icon baseClassName="material-icons material-icons-outlined">add</Icon>
                        </IconWrapper>
                    </Button>
                    <ListItemButton component={ListItemButton} onClick={handleClick}>

                        <ListItemIcon>
                            <Icon
                                baseClassName="material-icons material-icons-outlined">{open ? 'expand_less' : 'expand_more'}</Icon>
                        </ListItemIcon>

                    </ListItemButton>


                </div>
                <Collapse in={open} timeout="auto" unmountOnExit>

                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Name"
                        autoComplete="provider_name"

                        placeholder="add name…"

                        {...register("name", {required: true})}
                    />
                    <TextField
                        inputProps={{'aria-label': 'info'}}
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="info"
                        label="Info"
                        autoComplete="info"

                        {...register("info", {required: false, value: "dcr provider"})}
                    />
                    <TextField
                        inputProps={{'aria-label': 'info'}}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="redirect_uris"
                        label="Redirect Uris"
                        autoComplete="redirect_uris"


                        {...register("config.redirect_uris", {required: true})}
                    />

                    <TextField
                        inputProps={{'aria-label': 'scope'}}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="scope"
                        label="scope"
                        autoComplete="scope"


                        {...register("config.scope", {required: true})}
                    />


                    {/* <Button
                    type="submit"
                    color="primary">
                    <ListSubheader>
                        <Icon baseClassName="material-icons material-icons-outlined">identity</Icon>


                        <ListItemIcon>Submit</ListItemIcon>
                    </ListSubheader>
                </Button>*/}
                </Collapse>

            </form>

            <Collapse in={open} timeout="auto" unmountOnExit>
                <form onSubmit={handleSubmit(addIssuer)}>

                </form>

            </Collapse>
        </div>
    )
}

const isValidUrl = (urlString: any) => {
    try {
        return urlString && new URL(urlString);
    } catch (e) {
        return false;
    }
    return true;
};