package com.atlassian.jira.issuesAppDataCenter.webwork;

import com.atlassian.jira.web.action.JiraWebActionSupport;
import com.atlassian.sal.api.pluginsettings.PluginSettings;
import com.atlassian.sal.api.pluginsettings.PluginSettingsFactory;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;

import javax.inject.Inject;
import javax.inject.Named;

@Named
public class IssuesAppSettingsAction extends JiraWebActionSupport {
    private final PluginSettingsFactory pluginSettingsFactory;

    private String projectKey;
    private String action;
    private boolean isEnabled;

    @Inject
    public IssuesAppSettingsAction(@ComponentImport PluginSettingsFactory pluginSettingsFactory) {
        this.pluginSettingsFactory = pluginSettingsFactory;
    }

    @Override
    public String execute() throws Exception {
        if (projectKey == null) {
            return ERROR;
        }

        PluginSettings settings = pluginSettingsFactory.createSettingsForKey("issues-app-settings:" + projectKey);
        if ("enable".equals(action)) {
            settings.put("enabled", "true");
        } else if ("disable".equals(action)) {
            settings.put("enabled", "false");
        }

        isEnabled = "true".equals(settings.get("enabled"));
        return SUCCESS;
    }

    public void setProjectKey(String projectKey) {
        this.projectKey = projectKey;
    }

    public String getProjectKey() {
        return projectKey;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public boolean getIsEnabled() {
        return isEnabled;
    }
}
