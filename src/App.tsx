// import logo from "./logo.svg";
import React, {useEffect, useContext} from "react";
import "./App.css";
import "./styles/globals.css";
import SignIn from "./components/SignIn";
import {authMachine, AuthService} from "./machines/authMachine";
import {Router} from "@reach/router";
import {useMachine} from "@xstate/react";
import {AnyState} from "xstate";
import {Box, Container, responsiveFontSizes, Stack} from "@mui/material";
import {SnackbarContext, snackbarMachine} from "./machines/snackbarMachine";
import AlertBar from "./components/AlertBar";
import {notificationMachine} from "./machines/notificationsMachine";
import NotificationsContainer from "./containers/NotificationsContainer";
import ProfileContainer from "./containers/ProfileContainer";
import EventsContainer from "./containers/ActionsContainer";
import {useInterpretWithLocalStorage} from "./machines/withLocalStorage";
import {PrivateRoute} from "./routes";

import {ThemeProvider, Theme, StyledEngineProvider, createTheme} from '@mui/material/styles';

import {Auth, AuthContext, AuthProvider} from "./auth";
import { green, purple } from '@mui/material/colors';


declare module '@mui/styles/defaultTheme' {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DefaultTheme extends Theme {
    }
}
const theme = createTheme({
    palette: {
        // secondary: {
        //     main: '#999'
        // },
        primary: {
            main: '#7a7a7a'
        }

    },

    typography: {
        h5: {
            font: 'Questrial',
            fontStyle: 'lighter',
            fontWeight: 'lighter',
            fontSize: '14px',
            fontFamily: "'Questrial', sans-serif !important"
        },
        button:{
            font: 'Questrial',
            fontStyle: 'lighter',
            fontWeight: 'lighter',
            fontFamily: "'Questrial', sans-serif !important",
            fontSize: '14px',
            opacity: 0.8
        },
        fontFamily: [
            'Questrial',
            'sans-serif',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',

            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
    },
});


const App = () => {
    const responsiveTheme = responsiveFontSizes(theme);
 
    // @ts-ignore
    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={responsiveTheme}>
                <AuthProvider>
                        <AppWithService/>
                </AuthProvider>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};
const AppWithService = () => {
    const authService = useContext(AuthContext);
    const [, sendSnackbar, snackbarService] = useMachine(snackbarMachine);
    const [, sendNotification, notificationService] = useMachine(notificationMachine);

    const showSnackbar = (payload: SnackbarContext) => sendSnackbar({type: "SHOW", ...payload});

    useEffect(() => {
        if (authService) {
            const subscription = authService.subscribe((state: AnyState) => {
                // simple state logging
                console.log(state);
                showSnackbar({message: state.value.toString(), severity: "info"})

            });
            return subscription.unsubscribe;

        }
        return () => {
        };

    }, [authService]);

    if (authService) {


        return (<div>
            <EventsContainer authService={authService} notificationsService={notificationService}/>

            <Box>
                <Stack
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="stretch"
                    spacing={0.5}
                >
                    <Container  >

                    <Router>
                        <PrivateRoute default as={ProfileContainer} path={"/"}
                                      authService={authService}
                                      notificationsService={notificationService}
                        />
                        <SignIn path={"/signin"} authService={authService} notificationsService={notificationService} />
                        <ProfileContainer path="/profile" authService={authService} notificationsService={notificationService}/>

                    </Router>
                    </Container>

                    <Container  maxWidth="sm">
                        <NotificationsContainer authService={authService}
                                                notificationsService={notificationService}/>
                    </Container>
                </Stack>

            </Box>

            <AlertBar snackbarService={snackbarService}/>

        </div>)
    } else {
        return <div>loading..</div>
    }
}

export default App;
