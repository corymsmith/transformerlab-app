import { useNavigate } from 'react-router-dom';

import List from '@mui/joy/List';
import Divider from '@mui/joy/Divider';

import {
  CodeIcon,
  GraduationCapIcon,
  HelpCircleIcon,
  LayersIcon,
  MessageCircleIcon,
  SlidersIcon,
  TextSelectIcon,
  FileDigitIcon,
  BoxesIcon,
  FileTextIcon,
  MonitorIcon,
  FlaskConicalIcon,
  SettingsIcon,
  GithubIcon,
  ArrowRightFromLineIcon,
  PlugIcon,
} from 'lucide-react';

import { ButtonGroup, IconButton, Sheet, Tooltip } from '@mui/joy';

import { useModelStatus } from 'renderer/lib/transformerlab-api-sdk';

import SelectExperimentMenu from '../Experiment/SelectExperimentMenu';

import SubNavItem from './SubNavItem';
import ColorSchemeToggle from './ColorSchemeToggle';

export default function Sidebar({
  experimentInfo,
  setExperimentId,
  setDrawerOpen,
}) {
  const { models, isError, isLoading } = useModelStatus();

  const navigate = useNavigate();

  function activeModelIsNotSameAsFoundation() {
    if (models === null) {
      return true;
    }

    if (!experimentInfo?.name) {
      return true;
    }

    // The API may respond with the ID of the model, or the model filename or the adaptor
    return (
      models?.[0]?.id !==
        experimentInfo?.config?.foundation?.split('/').slice(-1)[0] &&
      models?.[0]?.id !==
        experimentInfo?.config?.foundation_filename?.split('/').slice(-1)[0] &&
      models?.[0]?.id !== experimentInfo?.config.adaptor
    );
  }

  return (
    <Sheet
      className="Sidebar"
      sx={{
        gridArea: 'sidebar',
        borderRight: '1px solid',
        borderColor: 'divider',
        transition: 'transform 0.4s',
        zIndex: 100,
        height: '100%',
        overflow: 'auto',
        top: 0,
        p: 2,
        py: 1,
        pt: '60px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        userSelect: 'none',
        width: '100%',
        backgroundColor: 'rgb(214,207,225,0.5)',
      }}
    >
      <SelectExperimentMenu
        experimentInfo={experimentInfo}
        setExperimentId={setExperimentId}
        models={models}
      />
      <List
        sx={{
          '--ListItem-radius': '8px',
          '--ListItem-minHeight': '32px',
          '--List-gap': '4px',
          overflowY: 'auto',
        }}
      >
        <SubNavItem
          title="Foundation"
          path="/projects/model"
          icon={<LayersIcon />}
          disabled={!experimentInfo?.name}
        />
        <SubNavItem
          title="Prompt"
          path="/projects/prompt"
          icon={<TextSelectIcon />}
          disabled={!experimentInfo?.name}
        />
        <SubNavItem
          title="Interact"
          path="/projects/chat"
          icon={<MessageCircleIcon />}
          disabled={!experimentInfo?.name || activeModelIsNotSameAsFoundation()}
        />
        <SubNavItem
          title="Embeddings"
          path="/projects/embeddings"
          icon={<FileDigitIcon />}
          disabled={activeModelIsNotSameAsFoundation()}
        />
        <SubNavItem
          title="Train"
          path="/projects/training"
          icon={<GraduationCapIcon />}
          disabled={
            !experimentInfo?.name || !experimentInfo?.config?.foundation
          }
        />
        <SubNavItem
          title="Export"
          path="/projects/export"
          icon={<ArrowRightFromLineIcon />}
          disabled={
            !experimentInfo?.name || !experimentInfo?.config?.foundation
          }
        />
        <SubNavItem
          title="Evaluate"
          path="/projects/eval"
          icon={<HelpCircleIcon />}
          disabled={!experimentInfo?.name}
        />
        <SubNavItem
          title="Notes"
          path="/projects/notes"
          icon={<FlaskConicalIcon />}
          disabled={!experimentInfo?.name}
        />
        <SubNavItem
          title="API"
          path="/projects/api"
          icon={<CodeIcon />}
          disabled={!experimentInfo?.name}
        />
        <SubNavItem
          title="Plugins"
          path="/projects/plugins"
          icon={<PlugIcon />}
          disabled={!experimentInfo?.name}
          counter={null}
        />
        <SubNavItem
          title="Settings"
          path="/projects/settings"
          icon={<SlidersIcon />}
          disabled={!experimentInfo?.name}
        />
      </List>
      <List sx={{ justifyContent: 'flex-end' }}>
        <Divider sx={{ marginBottom: 2 }} />

        <SubNavItem
          title="Model Zoo"
          path="/zoo"
          icon={<BoxesIcon />}
          disabled={false}
        />
        <SubNavItem
          title="Training Data"
          path="/data"
          icon={<FileTextIcon />}
          disabled={false}
        />
        <SubNavItem
          title="Computer"
          path="/computer"
          icon={<MonitorIcon />}
          disabled={false}
        />
        {/* <SubNavItem
          title="Logs"
          path="/logs"
          icon={<TextIcon />}
          disabled={false}
        /> */}
        {/* <ListItem>
          <ListItemButton
            onClick={() => {
              setDrawerOpen(true);
            }}
            sx={{ justifyContent: 'center' }}
          >
            <ListItemDecorator>
              <TerminalSquareIcon strokeWidth={1.5} />
            </ListItemDecorator>
            <ListItemContent>Terminal</ListItemContent>
          </ListItemButton>
        </ListItem> */}
        <Divider sx={{ my: 2 }} />
        <ButtonGroup sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <ColorSchemeToggle />
          <a
            href="https://github.com/transformerlab/transformerlab-app/"
            target="_blank"
          >
            <Tooltip
              title={
                <>
                  Visit Transformer Lab on Github
                  <br />
                  to contribute to the project or
                  <br />
                  send a bug report.
                </>
              }
            >
              <IconButton variant="plain">
                <GithubIcon strokeWidth={1} />
              </IconButton>
            </Tooltip>
          </a>
          <Tooltip title="Settings">
            <IconButton variant="plain" onClick={() => navigate('/settings')}>
              <SettingsIcon strokeWidth={1} />
            </IconButton>
          </Tooltip>
        </ButtonGroup>
      </List>
    </Sheet>
  );
}
