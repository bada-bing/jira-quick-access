import {
  ActionPanel,
  Action,
  Icon,
  List,
  getPreferenceValues,
} from "@raycast/api";
import { useFetch } from "@raycast/utils";

const preferences: ExtensionPreferences = getPreferenceValues();

const baseUrl = preferences.apiBasePath;
const user = preferences.currentUser;
const token = preferences.apiToken;

const data = {
  jql: "assignee = currentUser() AND issuetype != Sub-task ORDER BY updated DESC",
  maxResults: 10,
  fields: ["summary", "status", "issuetype", "updated"],
};

const config = {
  method: "post",
  url: `${baseUrl}/rest/api/3/search`,
  headers: {
    accept: "application/json",
    "Accept-Language": "en-US,en",
    "Content-Type": "application/json",
    Authorization:
      "Basic " + Buffer.from(`${user}:${token}`).toString("base64"),
  },
  data: data,
} as const;

type JiraIssue = {
  id: string;
  key: string;
  fields: {
    summary: string;
    issuetype: Record<string, any> & { name: string; subtask: boolean };
    updated: string;
    status: {
      self: string;
      description: string;
      iconUrl: string;
    };
  };
};

export default function Command() {
  const { data } = useFetch<{ issues: JiraIssue[] }>(config.url, {
    method: "post",
    headers: config.headers,
    body: JSON.stringify(config.data),
    parseResponse: async (response) => await response.json(),
  });

  return (
    <List>
      {data?.issues.map((item) => (
        <List.Item
          key={item.id}
          icon="list-icon.png"
          title={item.key}
          subtitle={item.fields.summary}
          // accessories={[{ icon: Icon.Text, text: item.id }]}
          actions={
            <ActionPanel>
              <Action.CopyToClipboard content={item.key} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
