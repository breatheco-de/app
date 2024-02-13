import React from 'react';
import { Box } from '@chakra-ui/layout';
import Feedback from '../common/components/Feedback';

export default {
  title: 'Components/Feedback',
  component: Feedback,
  argTypes: {
    isAuthenticatedWithRigobot: {
      control: {
        type: 'boolean',
      },
    },
    externalCodeRevisions: {
      control: {
        type: 'object',
      },
    },
    storyConfig: {
      control: {
        type: 'hidden',
      },
    }
  },
};

const Template = (args) => {
  console.log('args', args);
  const isAuthenticatedWithRigobot = args?.isAuthenticatedWithRigobot;
  const externalCodeRevisions = args?.externalCodeRevisions;

  return (
  <Box>
    <Feedback
      storyConfig={{
        ...args,
        isAuthenticatedWithRigobot,
        externalCodeRevisions,
      }}
    />
  </Box>
)};

export const Default = Template.bind({});
Default.args = {
  isAuthenticatedWithRigobot: false,
  externalCodeRevisions: [
    {
      "id": 1,
      "comment": "So bad your  c ode bro",
      "original_code": "LASK_ENV # Imported from Heroku app\r\nvalue: production\r\n- key: FLASK_APP_KEY # Imported from Heroku app\r\nvalue: \"any key works\"\r\n- key: DATABASE_URL # Render PostgreSQL database\r\nfromDatabase:\r\nname: postgresql-trapezoidal-42170\r\nproperty: connectionString\r\n\r\ndatabases: # Render PostgreSQL database",
      "committers": [
        {
          "id": 1,
          "name": 'Charlytoc',
          "github_username": "charlytoc"
        }
      ],
      "reviewer": {
        "id": 2,
        "name": 'Charlytoc-132',
        "username": "charlytoc-132@proton.me"
      },
      "user_read_at": null,
      "revision_rating": null,
      "revision_rating_comments": null,
      "file": {
        "id": 11,
        "file_url": "https://api.github.com/repos/Charlytoc/where2day/contents/render.yaml?ref=ccac40dcebcc326c195c4a18ede6237ed23d78e8",
        "content": "services:\n    - type: web # valid values: https://render.com/docs/yaml-spec#type\n      region: ohio\n      name: sample-service-name\n      env: python # valid values: https://render.com/docs/yaml-spec#environment\n      buildCommand: \"./render_build.sh\"\n      startCommand: \"gunicorn wsgi --chdir ./src/\"\n      plan: free # optional; defaults to starter\n      numInstances: 1\n      envVars:\n          - key: BASENAME # Imported from Heroku app\n            value: /\n          - key: FLASK_APP # Imported from Heroku app\n            value: src/app.py\n          - key: FLASK_ENV # Imported from Heroku app\n            value: production\n          - key: FLASK_APP_KEY # Imported from Heroku app\n            value: \"any key works\"\n          - key: DATABASE_URL # Render PostgreSQL database\n            fromDatabase:\n                name: postgresql-trapezoidal-42170\n                property: connectionString\n\ndatabases: # Render PostgreSQL database\n    - name: postgresql-trapezoidal-42170\n      region: ohio\n      ipAllowList: [] # only allow internal connections\n      plan: free # optional; defaults to starter\n",
        "added_lines": "services:\n    - type: web # valid values: https://render.com/docs/yaml-spec#type\n      region: ohio\n      name: sample-service-name\n      env: python # valid values: https://render.com/docs/yaml-spec#environment\n      buildCommand: \"./render_build.sh\"\n      startCommand: \"gunicorn wsgi --chdir ./src/\"\n      plan: free # optional; defaults to starter\n      numInstances: 1\n      envVars:\n          - key: BASENAME # Imported from Heroku app\n            value: /\n          - key: FLASK_APP # Imported from Heroku app\n            value: src/app.py\n          - key: FLASK_ENV # Imported from Heroku app\n            value: production\n          - key: FLASK_APP_KEY # Imported from Heroku app\n            value: \"any key works\"\n          - key: DATABASE_URL # Render PostgreSQL database\n            fromDatabase:\n                name: postgresql-trapezoidal-42170\n                property: connectionString\n\ndatabases: # Render PostgreSQL database\n    - name: postgresql-trapezoidal-42170\n      region: ohio\n      ipAllowList: [] # only allow internal connections\n      plan: free # optional; defaults to starter",
        "name": "render.yaml",
        "language": "python"
      },
      "created_at": "2023-05-30T17:54:35.040Z",
      "updated_at": "2023-05-30T17:54:35.050Z",
      "language": null,
      "repository": {
        "id": 3,
        "owner": "Charlytoc",
        "name": "where2day",
        "url": "https://github.com/Charlytoc/where2day"
      }
    },
    {
      "id": 2,
      "comment": "Pretty ugly",
      "original_code": "# Imported from Heroku app\r\nvalue: src/app.py\r\n- key: FLASK_ENV # Imported from Heroku app\r\nvalue: production\r\n- key: FLASK_APP_KEY # Imported from Heroku app\r\nvalue: \"any key works\"\r\n- key: DATABASE_URL # Render PostgreSQL database\r\nfromDatabase:\r\nname: postgresql-trapezoidal-42170",
      "committers": [
        {
          "id": 1,
          "name": 'Charlytoc',
          "github_username": "charlytoc"
        }
      ],
      "reviewer": {
        "id": 2,
        "name": 'Charlytoc-132',
        "username": "charlytoc-132@proton.me"
      },
      "user_read_at": null,
      "revision_rating": null,
      "revision_rating_comments": null,
      "file": {
        "id": 11,
        "file_url": "https://api.github.com/repos/Charlytoc/where2day/contents/render.yaml?ref=ccac40dcebcc326c195c4a18ede6237ed23d78e8",
        "content": "services:\n    - type: web # valid values: https://render.com/docs/yaml-spec#type\n      region: ohio\n      name: sample-service-name\n      env: python # valid values: https://render.com/docs/yaml-spec#environment\n      buildCommand: \"./render_build.sh\"\n      startCommand: \"gunicorn wsgi --chdir ./src/\"\n      plan: free # optional; defaults to starter\n      numInstances: 1\n      envVars:\n          - key: BASENAME # Imported from Heroku app\n            value: /\n          - key: FLASK_APP # Imported from Heroku app\n            value: src/app.py\n          - key: FLASK_ENV # Imported from Heroku app\n            value: production\n          - key: FLASK_APP_KEY # Imported from Heroku app\n            value: \"any key works\"\n          - key: DATABASE_URL # Render PostgreSQL database\n            fromDatabase:\n                name: postgresql-trapezoidal-42170\n                property: connectionString\n\ndatabases: # Render PostgreSQL database\n    - name: postgresql-trapezoidal-42170\n      region: ohio\n      ipAllowList: [] # only allow internal connections\n      plan: free # optional; defaults to starter\n",
        "added_lines": "services:\n    - type: web # valid values: https://render.com/docs/yaml-spec#type\n      region: ohio\n      name: sample-service-name\n      env: python # valid values: https://render.com/docs/yaml-spec#environment\n      buildCommand: \"./render_build.sh\"\n      startCommand: \"gunicorn wsgi --chdir ./src/\"\n      plan: free # optional; defaults to starter\n      numInstances: 1\n      envVars:\n          - key: BASENAME # Imported from Heroku app\n            value: /\n          - key: FLASK_APP # Imported from Heroku app\n            value: src/app.py\n          - key: FLASK_ENV # Imported from Heroku app\n            value: production\n          - key: FLASK_APP_KEY # Imported from Heroku app\n            value: \"any key works\"\n          - key: DATABASE_URL # Render PostgreSQL database\n            fromDatabase:\n                name: postgresql-trapezoidal-42170\n                property: connectionString\n\ndatabases: # Render PostgreSQL database\n    - name: postgresql-trapezoidal-42170\n      region: ohio\n      ipAllowList: [] # only allow internal connections\n      plan: free # optional; defaults to starter",
        "name": "render.yaml",
        "language": "python"
      },
      "created_at": "2023-05-30T17:54:41.473Z",
      "updated_at": "2023-05-30T17:54:41.478Z",
      "language": null,
      "repository": {
        "id": 3,
        "owner": "Charlytoc",
        "name": "where2day",
        "url": "https://github.com/Charlytoc/where2day"
      }
    }
  ]
};
