package com.atlassian.trainDS.servlet;

import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.atlassian.sal.api.pluginsettings.PluginSettings;
import com.atlassian.sal.api.pluginsettings.PluginSettingsFactory;
import com.atlassian.templaterenderer.TemplateRenderer;
import org.springframework.stereotype.Component; // Added this import

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component // Changed from @Scanned to @Component
public class ConfigServlet extends HttpServlet {

    @ComponentImport
    private final PluginSettingsFactory pluginSettingsFactory;
    @ComponentImport
    private final TemplateRenderer templateRenderer;

    public ConfigServlet(PluginSettingsFactory pluginSettingsFactory, TemplateRenderer templateRenderer) {
        this.pluginSettingsFactory = pluginSettingsFactory;
        this.templateRenderer = templateRenderer;
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        PluginSettings pluginSettings = pluginSettingsFactory.createGlobalSettings();
        String allowedGroups = (String) pluginSettings.get("dc-project-issue-viewer.allowedGroups");

        Map<String, Object> context = new HashMap<>();
        context.put("allowedGroups", allowedGroups != null ? allowedGroups : "");

        resp.setContentType("text/html;charset=utf-8");
        templateRenderer.render("config.vm", context, resp.getWriter());
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        PluginSettings pluginSettings = pluginSettingsFactory.createGlobalSettings();
        String allowedGroups = req.getParameter("allowedGroups");

        if (allowedGroups != null) {
            pluginSettings.put("dc-project-issue-viewer.allowedGroups", allowedGroups);
        }

        resp.sendRedirect(req.getContextPath() + "/plugins/servlet/admin/project-viewer-config");
    }
}
