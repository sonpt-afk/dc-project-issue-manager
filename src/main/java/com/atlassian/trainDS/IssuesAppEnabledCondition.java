package com.atlassian.jira.issuesAppDataCenter;

import com.atlassian.jira.project.Project;
import com.atlassian.plugin.web.Condition;
import com.atlassian.plugin.web.ContextProvider;
import com.atlassian.sal.api.pluginsettings.PluginSettings;
import com.atlassian.sal.api.pluginsettings.PluginSettingsFactory;

import javax.inject.Inject;
import javax.inject.Named;
import java.util.Map;

@Named
public class IssuesAppEnabledCondition implements Condition {

    private final PluginSettingsFactory pluginSettingsFactory;

    @Inject
    public IssuesAppEnabledCondition(PluginSettingsFactory pluginSettingsFactory) {
        this.pluginSettingsFactory = pluginSettingsFactory;
    }

    @Override
    public void init(Map<String, String> params) {}

    @Override
    public boolean shouldDisplay(Map<String, Object> context) {
        Project project = (Project) context.get("project");
        if (project == null) {
            return false;
        }
        PluginSettings settings = pluginSettingsFactory.createSettingsForKey("issues-app-settings:" + project.getKey());
        Object value = settings.get("enabled");
        return "true".equals(value);
    }
}