import { css, cx } from '@emotion/css';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Subtitle,
  Description,
  Link,
  spacing,
  uiColors,
} from '@mongodb-js/compass-components';

import createLoggerAndTelemetry from '@mongodb-js/compass-logging';
const { track } = createLoggerAndTelemetry('COMPASS-CONNECTIONS-UI');

const formHelpContainerStyles = css({
  position: 'relative',
  margin: spacing[4],
  minWidth: 250,
  maxWidth: 400,
  display: 'inline-block',
});

const atlasContainerStyles = css({
  backgroundColor: uiColors.green.light3,
  paddingBottom: spacing[4],
});

const sectionContainerStyles = css({
  margin: 0,
  padding: spacing[4],
  paddingBottom: 0,
});

const titleStyles = css({
  fontWeight: 'bold',
  fontSize: 14,
});

const descriptionStyles = css({
  marginTop: spacing[2],
  fontSize: 14,
});

const createClusterContainerStyles = css({
  marginTop: spacing[2],
});

const createClusterButtonStyles = css({
  fontWeight: 'bold',
  background: uiColors.white,
  '&:hover': {
    background: uiColors.white,
  },
  '&:focus': {
    background: uiColors.white,
  },
});

function FormHelp(): React.ReactElement {
  return (
    <div className={formHelpContainerStyles}>
      <div className={cx(sectionContainerStyles, atlasContainerStyles)}>
        <Subtitle className={titleStyles}>
          New to Compass and don&apos;t have a cluster?
        </Subtitle>
        <Description className={descriptionStyles}>
          If you don&apos;t already have a cluster, you can create one for free
          using{' '}
          <Link href="https://www.mongodb.com/cloud/atlas" target="_blank">
            MongoDB Atlas
          </Link>
        </Description>
        <div className={createClusterContainerStyles}>
          <Button
            data-testid="atlas-cta-link"
            className={createClusterButtonStyles}
            onClick={() => track('Atlas Link Clicked', { screen: 'connect' })}
            variant={ButtonVariant.PrimaryOutline}
            href="https://www.mongodb.com/cloud/atlas/lp/general/try?utm_source=compass&utm_medium=product"
            target="_blank"
            size={ButtonSize.Small}
          >
            CREATE FREE CLUSTER
          </Button>
        </div>
      </div>
      <div className={sectionContainerStyles}>
        <Subtitle className={titleStyles}>
          How do I find my connection string in Atlas?
        </Subtitle>
        <Description className={descriptionStyles}>
          If you have an Atlas cluster, go to the Cluster view. Click the
          &apos;Connect&apos; button for the cluster to which you wish to
          connect.
        </Description>
        <Link
          href="https://docs.atlas.mongodb.com/compass-connection/"
          target="_blank"
        >
          See example
        </Link>
      </div>
      <div className={sectionContainerStyles}>
        <Subtitle className={titleStyles}>
          How do I format my connection string?
        </Subtitle>
        <Link
          href="https://docs.mongodb.com/manual/reference/connection-string/"
          target="_blank"
        >
          See example
        </Link>
      </div>
    </div>
  );
}

export default FormHelp;
