package com.atlassian.trainDS.servlet;

import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.atlassian.sal.api.pluginsettings.PluginSettings;
import com.atlassian.sal.api.pluginsettings.PluginSettingsFactory;
import com.atlassian.sal.api.user.UserManager;
import com.atlassian.sal.api.user.UserProfile;
import com.atlassian.templaterenderer.TemplateRenderer;
import org.springframework.stereotype.Component;

import javax.inject.Inject;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Component
public class AppServlet extends HttpServlet {
    private final TemplateRenderer templateRenderer;
    private final PluginSettingsFactory pluginSettingsFactory;
    private final UserManager userManager;

    @Inject
    public AppServlet(@ComponentImport TemplateRenderer templateRenderer,
                      @ComponentImport PluginSettingsFactory pluginSettingsFactory,
                      @ComponentImport UserManager userManager) {
        this.templateRenderer = templateRenderer;
        this.pluginSettingsFactory = pluginSettingsFactory;
        this.userManager = userManager;
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html;charset=utf-8");

        PluginSettings pluginSettings = pluginSettingsFactory.createGlobalSettings();
        String allowedGroupsStr = (String) pluginSettings.get("dc-project-issue-viewer.allowedGroups");

        if (allowedGroupsStr != null && !allowedGroupsStr.trim().isEmpty()) {
            Set<String> allowedGroups = new HashSet<>(Arrays.asList(allowedGroupsStr.split(",")));
            UserProfile user = userManager.getRemoteUser(req);

            if (user == null || !isUserInAllowedGroup(user, allowedGroups)) {
                templateRenderer.render("access-denied.vm", resp.getWriter());
                return;
            }
        }
        templateRenderer.render("templates/app.vm", resp.getWriter());
    }

    private boolean isUserInAllowedGroup(UserProfile user, Set<String> allowedGroups) {
        for (String group : allowedGroups) {
            if (userManager.isUserInGroup(user.getUserKey(), group.trim())) {
                return true;
            }
        }
        return false;
    }
}
