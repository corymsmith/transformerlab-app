import {
  Button,
  ButtonGroup,
  Chip,
  CircularProgress,
  Sheet,
  Stack,
  Step,
  StepIndicator,
  Stepper,
  Typography,
} from '@mui/joy';
import { AppleIcon, PlayIcon, Type } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useCheckLocalConnection } from 'renderer/lib/transformerlab-api-sdk';

import * as chatAPI from '../../lib/transformerlab-api-sdk';

import { FaApple } from 'react-icons/fa6';

// Runs a callback every delay milliseconds, up to repetitions times.
// If the callback returns true, the interval is cleared.
// If the callback returns false, and the interval has run repetitions times, the notSuccessful callback is run.
function setIntervalXTimes(callback, notSuccessful, delay, repetitions) {
  var x = 0;
  var intervalID = window.setInterval(async function () {
    console.log(`trying ${x} times`);
    const response = await callback();

    if (response) {
      window.clearInterval(intervalID);
    } else if (++x === repetitions) {
      notSuccessful();
      window.clearInterval(intervalID);
    }
  }, delay);
}

function CheckIfInstalled({ activeStep, setActiveStep }) {
  const [installStatus, setInstallStatus] = useState('pending'); // notstarted, pending, success, error

  useEffect(() => {
    if (activeStep !== 1) return;
    (async () => {
      const serverIsInstalled = await window.electron.ipcRenderer.invoke(
        'server:checkIfInstalledLocally'
      );
      if (serverIsInstalled) {
        setInstallStatus('success');
        setActiveStep(2);
      } else {
        setInstallStatus('notstarted');
      }
    })();
  }, [activeStep]);

  return (
    <>
      <Stack spacing={1}>
        {/* <Typography level="body-sm">
          Check if Transformer Lab API is installed on your computer
        </Typography> */}
        {installStatus === 'pending' && <CircularProgress color="primary" />}
        {installStatus === 'notstarted' && (
          <Chip color="danger" variant="outlined">
            Not Installed
          </Chip>
        )}
        {installStatus === 'success' && <Chip color="success">Success!</Chip>}
        {installStatus === 'error' && <Chip color="danger">Error </Chip>}

        <ButtonGroup variant="plain" spacing={1}>
          {activeStep == 1 && installStatus == 'notstarted' && (
            <Button
              variant="solid"
              onClick={async () => {
                await window.electron.ipcRenderer.invoke(
                  'server:InstallLocally'
                );
                setInstallStatus('pending');
                setIntervalXTimes(
                  async () => {
                    const serverIsInstalled =
                      await window.electron.ipcRenderer.invoke(
                        'server:checkIfInstalledLocally'
                      );
                    if (serverIsInstalled) {
                      setInstallStatus('success');
                      setActiveStep(2);
                      return true;
                    }
                    return false;
                  },
                  () => {
                    setInstallStatus('error');
                  },
                  2000,
                  8
                );
              }}
            >
              Install Transformer Lab Server API
            </Button>
          )}
        </ButtonGroup>
      </Stack>
    </>
  );
}

function CheckCurrentVersion({ activeStep, setActiveStep }) {
  const [version, setVersion] = useState('pending'); // pending, or #.#.#

  useEffect(() => {
    if (activeStep !== 2) return;

    (async () => {
      const ver = await window.electron.ipcRenderer.invoke(
        'server:checkLocalVersion'
      );
      setVersion(ver);

      if (ver === '0.1.4') {
        setActiveStep(3);
      }
    })();
  }, [activeStep]);

  return (
    <>
      <Stack spacing={1}>
        <Typography level="body-sm">
          Your version of Transformer Lab API is {version}
        </Typography>
        {version == '0.1.4' && <Chip color="success">Success!</Chip>}

        {activeStep == 2 && (
          <ButtonGroup variant="plain" spacing={1}>
            <Button
              variant="solid"
              onClick={() => {
                setActiveStep(3);
              }}
            >
              Next
            </Button>
          </ButtonGroup>
        )}
      </Stack>
    </>
  );
}

function RunServer({ activeStep, setActiveStep }) {
  const [thinking, setThinking] = useState(false);
  const {
    server,
    isLoading: serverIsLoading,
    error: serverError,
  } = useCheckLocalConnection();

  useEffect(() => {
    if (activeStep !== 3) return;

    if (server && !serverError) {
      console.log('I think things are good');
      setActiveStep(4);
      return;
    } else {
      setIntervalXTimes(
        async () => {
          if (!server || serverError) return false;
          setActiveStep(4);
          return true;
        },
        () => {},
        2000,
        8
      );
    }
  }, [activeStep, server]);

  return (
    <>
      <Stack spacing={1}>
        {server && !serverError && <Chip color="success">Success!</Chip>}
        {activeStep == 3 && (!server || serverError) && (
          <Chip color="danger">Not Running</Chip>
        )}
        <ButtonGroup variant="plain" spacing={1}>
          {activeStep == 3 &&
            (!server || serverError ? (
              thinking ? (
                <CircularProgress color="primary" />
              ) : (
                <>
                  <Button
                    variant="solid"
                    onClick={async () => {
                      setThinking(true);
                      await window.electron.ipcRenderer.invoke(
                        'server:startLocalServer'
                      );
                      //set interval to check if server is running every 2 seconds, 5 times:
                      setIntervalXTimes(
                        async () => {
                          if (!server || serverError) return false;
                          setThinking(false);
                          setActiveStep(4);
                          return true;
                        },
                        () => {
                          setThinking(false);
                        },
                        2000,
                        8
                      );
                    }}
                  >
                    Start
                  </Button>
                </>
              )
            ) : (
              ''
            ))}
        </ButtonGroup>
      </Stack>
    </>
  );
}

function CheckForPlugins({ activeStep, setActiveStep }) {
  const [missingPlugins, setMissingPlugins] = useState([]);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (activeStep !== 4) return;

    (async () => {
      const p = await fetch(
        'http://localhost:8000/plugins/list_missing_plugins_for_current_platform'
      );
      const json = await p.json();
      setMissingPlugins(json);

      if (json.length === 0) {
        setActiveStep(5);
      }
    })();
  }, [activeStep]);

  return (
    <>
      <Stack spacing={1}>
        {missingPlugins.length > 0 ? (
          <></> // {' '} <Chip color="warning">Missing Plugins</Chip>
        ) : (
          <Chip color="success">Plugins Installed!</Chip>
        )}

        <Typography level="body-sm">
          {platform.isMac() && platform.arch() == 'arm64' && (
            <>
              You are running on a <FaApple /> Mac with <b>Apple Silicon</b>
              .&nbsp;
            </>
          )}
          {missingPlugins.length > 0 &&
            'The following plugins are not yet installed:'}
        </Typography>
        <Typography level="body-sm" color="warning">
          {missingPlugins.map((p) => p).join(', ')}
        </Typography>

        {activeStep == 4 && (
          <ButtonGroup variant="plain" spacing={1}>
            <Button
              variant="solid"
              color="primary"
              onClick={async () => {
                setInstalling(true);
                await fetch(
                  'http://localhost:8000/plugins/install_missing_plugins_for_current_platform'
                );
                setInstalling(false);
                setMissingPlugins([]);
                setActiveStep(5);
                // setIntervalXTimes(
                //   async () => {
                //     const p = await fetch(
                //       'http://localhost:8000/plugins/list_missing_plugins_for_current_platform'
                //     );
                //     const json = await p.json();
                //     if (json.length === 0) {
                //       setMissingPlugins([]);
                //       setActiveStep(5);
                //       return true;
                //     }
                //     return false;
                //   },
                //   () => {},
                //   2000,
                //   12
                // );
              }}
              size="sm"
              disabled={installing}
              startDecorator={
                installing && <CircularProgress size="sm" color="primary" />
              }
            >
              Install{installing && 'ing'} Plugins
            </Button>
            {!installing && (
              <Button
                variant="plain"
                onClick={() => {
                  setActiveStep(5);
                }}
                size="sm"
              >
                Skip
              </Button>
            )}
          </ButtonGroup>
        )}
      </Stack>
    </>
  );
}

function ConnectToLocalServer({ activeStep, setActiveStep, tryToConnect }) {
  const {
    server,
    isLoading: serverIsLoading,
    error: serverError,
  } = useCheckLocalConnection();

  return (
    <>
      <Stack spacing={1}>
        {server ? <Chip color="warning">Not Connected</Chip> : 'Not running'}
        <ButtonGroup variant="plain" spacing={1}></ButtonGroup>
      </Stack>
    </>
  );
}

function InstallStepper({ setServer }) {
  const [activeStep, setActiveStep] = useState(1); // 0, 1, 2

  function tryToConnect() {
    const fullServer = 'http://' + 'localhost' + ':' + '8000' + '/';
    window.TransformerLab = {};
    window.TransformerLab.API_URL = fullServer;
    setActiveStep(1);
    setServer(fullServer);
  }
  return (
    <>
      <Stepper orientation="vertical">
        {/* Active Step: {activeStep} */}
        <Step
          indicator={
            <StepIndicator
              variant={activeStep == 1 ? 'solid' : 'soft'}
              color="primary"
            >
              1
            </StepIndicator>
          }
        >
          <Sheet variant="outlined" sx={{ p: 1 }}>
            <Typography level="title-sm">Check if Installed</Typography>

            <CheckIfInstalled
              activeStep={activeStep}
              setActiveStep={setActiveStep}
            />
          </Sheet>
        </Step>
        <Step
          indicator={
            <StepIndicator variant={activeStep == 2 ? 'solid' : 'soft'}>
              2
            </StepIndicator>
          }
        >
          <Sheet variant="outlined" sx={{ p: 1 }}>
            <Typography level="title-sm">Check Current Version</Typography>
            <CheckCurrentVersion
              activeStep={activeStep}
              setActiveStep={setActiveStep}
            />
          </Sheet>
        </Step>
        <Step
          indicator={
            <StepIndicator variant={activeStep == 3 ? 'solid' : 'soft'}>
              3
            </StepIndicator>
          }
        >
          <Sheet variant="outlined" sx={{ p: 1 }}>
            <Typography level="title-sm">
              Check if Server is Running Locally on Port 8000
            </Typography>
            <RunServer activeStep={activeStep} setActiveStep={setActiveStep} />
          </Sheet>
        </Step>
        <Step
          indicator={
            <StepIndicator variant={activeStep == 4 ? 'solid' : 'soft'}>
              4
            </StepIndicator>
          }
        >
          <Sheet variant="outlined" sx={{ p: 1 }}>
            <Typography level="title-sm">Install Important Plugins</Typography>
            <CheckForPlugins
              activeStep={activeStep}
              setActiveStep={setActiveStep}
            />
          </Sheet>
        </Step>
        {/* <Step
          indicator={
            <StepIndicator variant={activeStep == 5 ? 'solid' : 'soft'}>
              5
            </StepIndicator>
          }
        >
          <Sheet variant="outlined" sx={{ p: 1 }}>
            <Typography level="title-sm">Check if Connected</Typography>
            <ConnectToLocalServer
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              tryToConnect={tryToConnect}
            />
          </Sheet>
        </Step> */}
      </Stepper>
      {
        <Button
          size="lg"
          variant="solid"
          color="success"
          onClick={tryToConnect}
          startDecorator={<PlayIcon />}
          sx={{ width: '100%', mt: 2 }}
          disabled={activeStep !== 5}
        >
          Connect
        </Button>
      }
    </>
  );
}

function LocalConnection({ setServer }) {
  return (
    <Sheet sx={{ overflowY: 'auto' }}>
      {/* {serverError
        ? `Server is not running` + serverError && serverError.status
        : 'Server is connected'} */}
      <InstallStepper setServer={setServer} />
    </Sheet>
  );
}

export default LocalConnection;
