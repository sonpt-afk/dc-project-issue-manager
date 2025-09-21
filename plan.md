 đây là kế hoạch 7 ngày "từ zero tới hero" để bạn build app này cho Jira Data Center. Chúng ta sẽ làm "đúng chuẩn" – backend Java để phục vụ, frontend React/Atlaskit để render, và gọi thẳng Jira REST API từ frontend cho các nghiệp vụ chính.

Đây là lộ trình chi tiết, kèm command.

-----

## Ngày 1: Môi trường & Khởi tạo (Environment & Scaffolding)

**Mục tiêu:** Tạo một plugin P2 (Data Center) rỗng và chạy nó thành công trên một instance Jira local.

1.  **Cài đặt Atlassian SDK:** Tôi tin là bạn đã có, nếu chưa, hãy cài nó trước.

2.  **Tạo Plugin:** Mở terminal và chạy lệnh của Atlassian SDK:

    ```bash
    atlas-create-jira-plugin
    ```

      * Nó sẽ hỏi bạn `groupId` (ví dụ: `com.mycompany`), `artifactId` (tên app, ví dụ: `project-issue-viewer`), `version`, và `package`.

3.  **Vào thư mục dự án:**

    ```bash
    cd project-issue-viewer
    ```

4.  **Chạy Jira:** Đây là lệnh quan trọng nhất. Nó sẽ tải Jira về, cài đặt plugin của bạn và khởi động.

    ```bash
    atlas-run
    ```

      * Lần đầu chạy sẽ rất lâu. Các lần sau sẽ nhanh hơn.
      * Truy cập Jira tại: `http://localhost:2990/jira`
      * Login: `admin` / `admin`

5.  **Tip của "Jira God":** Mở file `pom.xml`. Kiểm tra và đảm bảo thẻ `<jira.version>` khớp với phiên bản Jira DC bạn muốn build. Ví dụ: `<jira.version>8.20.10</jira.version>`.

-----

## Ngày 2: Dựng Giao diện (UI Scaffolding)

**Mục tiêu:** Tạo một trang React rỗng dùng Atlaskit, và truy cập được từ một menu link trong Jira.

1.  **Định nghĩa Menu Link & Trang:** Mở file `src/main/resources/atlassian-plugin.xml`.

      * Chúng ta cần một `web-item` (link trên menu) và một `servlet` (để render trang React).

    <!-- end list -->

    ```xml
    <web-item key="project-viewer-menu-item" section="system.top.navigation.bar/apps_menu_links" weight="100">
      <label>Project Issue Viewer</label>
      <link>/plugins/servlet/project-viewer</link>
    </web-item>

    <servlet key="project-viewer-servlet" class="com.mycompany.projectissueviewer.servlet.AppServlet">
      <url-pattern>/project-viewer</url-pattern>
    </servlet>
    ```

2.  **Tạo Java Servlet:**

      * Tạo file `src/main/java/com/mycompany/projectissueviewer/servlet/AppServlet.java`.
      * Nó sẽ render một file template Velocity (`.vm`).

3.  **Cài đặt Frontend (React & Webpack):**

      * Trong thư mục gốc dự án, khởi tạo Node:
        ```bash
        npm init -y
        npm install --save-dev react react-dom webpack webpack-cli @babel/core @babel/preset-react babel-loader
        ```
      * Cài Atlaskit:
        ```bash
        npm install @atlaskit/css-reset @atlaskit/dynamic-table @atlaskit/select @atlaskit/pagination @atlaskit/button @atlaskit/modal-dialog @atlaskit/spinner @atlaskit/form @atlaskit/textfield
        ```
      * Tạo file `webpack.config.js` để bundle file React của bạn (ví dụ `src/main/js/app.js`) thành một file output (ví dụ `target/classes/js/app-bundle.js`).

4.  **Định nghĩa Web Resource:** Khai báo file JS đã bundle cho Jira biết. Sửa `atlassian-plugin.xml`:

    ```xml
    <web-resource key="project-viewer-resources">
      <dependency>com.atlassian.auiplugin:aui-page-header</dependency>
      <resource type="download" name="app-bundle.js" location="js/app-bundle.js"/>
      
      <context>jira.general</context> 
    </web-resource>
    ```

5.  **Tạo file .vm và App.js:**

      * Tạo `src/main/resources/templates/app.vm`. File này sẽ load React:
        ```html
        <html>
          <head>
            <title>Project Issue Viewer</title>
            $webResourceManager.requireResourcesForContext("jira.general")
            $webResourceManager.requireResource("com.mycompany.project-issue-viewer:project-viewer-resources")
          </head>
          <body>
            <div id="react-app-root"></div>
          </body>
        </html>
        ```
      * Tạo file React entry `src/main/js/app.js` và render một component `<App />` vào `react-app-root`.

6.  **Build và Chạy:**

    ```bash
    atlas-package -DskipTests && atlas-run
    ```

      * Truy cập link "Project Issue Viewer" và bạn sẽ thấy trang React của mình.

-----

## Ngày 3: Lấy Dữ liệu (Data Fetching)

**Mục tiêu:** Gọi Jira REST API từ React để lấy danh sách project và issues.

1.  **Lấy Projects (cho Dropdown):**

      * Trong component React, dùng `useEffect` để gọi API khi component mount.
      * **Tip của "Jira God":** Luôn dùng `AJS.contextPath()` để lấy base URL của Jira.
      * Ví dụ `fetch`:
        ```javascript
        useEffect(() => {
          fetch(`${AJS.contextPath()}/rest/api/2/project`)
            .then(res => res.json())
            .then(projects => {
              // Set projects vào React state
              // Format lại cho @atlaskit/select (label, value)
            });
        }, []);
        ```
      * Dùng `@atlaskit/select` để hiển thị dropdown.

2.  **Lấy Issues (cho Bảng):**

      * Tạo một hàm, gọi khi user chọn một project từ dropdown.
      * Sử dụng JQL qua API search:
        ```javascript
        const fetchIssues = (projectKey) => {
          // Hiện spinner
          const jql = `project = "${projectKey}"`;
          const fields = "issuetype,summary,status,assignee"; // CHỈ LẤY FIELD CẦN THIẾT
          
          fetch(`${AJS.contextPath()}/rest/api/2/search?jql=${encodeURIComponent(jql)}&fields=${fields}`)
            .then(res => res.json())
            .then(data => {
              // Set issues (data.issues) và total (data.total) vào state
              // Ẩn spinner
            });
        };
        ```

3.  **Hiển thị:** Dùng `@atlaskit/dynamic-table` để render dữ liệu `issues` trong state.

-----

## Ngày 4: Phân trang (Pagination)

**Mục tiêu:** Thêm phân trang cho bảng issues.

1.  **API Support:** Rất may, endpoint `/rest/api/2/search` hỗ trợ phân trang gốc bằng `startAt` và `maxResults`.
2.  **Thêm State:** Thêm state cho việc phân trang trong React:
      * `const [startAt, setStartAt] = useState(0);`
      * `const [totalIssues, setTotalIssues] = useState(0);`
      * `const maxResults = 20;` // Hoặc một con số tùy chọn
3.  **Cập nhật Fetch:** Sửa lại hàm `fetchIssues`:
    ```javascript
    //...
    fetch(`${AJS.contextPath()}/rest/api/2/search?jql=...&fields=...&startAt=${startAt}&maxResults=${maxResults}`)
      .then(res => res.json())
      .then(data => {
        setIssues(data.issues);
        setTotalIssues(data.total); // API trả về tổng số
      });
    //...
    ```
4.  **Thêm Component UI:** Thêm `@atlaskit/pagination` vào dưới bảng.
      * Tính toán `totalPages = Math.ceil(totalIssues / maxResults)`.
      * Truyền mảng các trang (pages) cho component.
      * Sự kiện `onChange` của Pagination sẽ cập nhật state `setStartAt((newPage - 1) * maxResults)`, sau đó gọi lại `fetchIssues`.

-----

## Ngày 5: Actions (Update & Delete)

**Mục tiêu:** Thêm nút "Delete" và "Update" cho mỗi dòng.

1.  **Thêm Cột Actions:** Thêm một cột vào `DynamicTable` chứa 2 component `@atlaskit/button`.

2.  **Hàm Delete:**

      * `onClick` của nút Delete: Mở một `@atlaskit/modal-dialog` để hỏi "Bạn có chắc không?".
      * Khi user nhấn "Confirm" trong modal:
        ```javascript
        const handleDelete = (issueKey) => {
          fetch(`${AJS.contextPath()}/rest/api/2/issue/${issueKey}`, {
            method: 'DELETE'
          })
          .then(res => {
            if (res.ok) {
              // Xóa thành công, gọi lại fetchIssues để refresh
              fetchIssues(selectedProjectKey); 
            } else {
              // Xử lý lỗi
            }
          });
        };
        ```

3.  **Hàm Update:**

      * `onClick` của nút Update: Mở một Modal khác.
      * Trong modal: Dùng `@atlaskit/form` và `@atlaskit/textfield` để cho phép sửa `summary`.
      * Khi Submit form:
        ```javascript
        const handleUpdate = (issueKey, newSummary) => {
          const body = {
            fields: {
              summary: newSummary
            }
          };

          fetch(`${AJS.contextPath()}/rest/api/2/issue/${issueKey}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          })
          .then(res => {
            if (res.ok) {
              // Update thành công, đóng modal, refresh list
              fetchIssues(selectedProjectKey);
            }
          });
        };
        ```

-----

## Ngày 6: Trang Cấu hình (Configuration Page)

**Mục tiêu:** Tạo trang Admin để "toggles access permissions". Đây là phần *bắt buộc* dùng Java backend để lưu trữ setting.

1.  **Tạo Servlet Cấu hình:**

      * Tạo file `ConfigServlet.java` (tương tự `AppServlet`).
      * Servlet này sẽ dùng `@ComponentImport PluginSettingsFactory` để đọc/ghi cấu hình.
      * `doGet`: Đọc setting (ví dụ: `pluginSettings.get("myApp.enabled")`) và render file `config.vm`.
      * `doPost`: Nhận data từ form, lưu setting (ví dụ: `pluginSettings.put("myApp.enabled", "true")`).

2.  **Tạo `config.vm`:**

      * Đây là trang config đơn giản, dùng AUI (có sẵn) sẽ nhanh hơn React.
      * Tạo một form HTML (`<form method="post">`) với một checkbox hoặc một ô text để nhập group.

3.  **Khai báo `atlassian-plugin.xml`:**

    ```xml
    <servlet key="project-viewer-config-servlet" class="com.mycompany.projectissueviewer.servlet.ConfigServlet">
      <url-pattern>/admin/project-viewer-config</url-pattern>
    </servlet>

    <web-item key="project-viewer-config-link" section="admin_plugins_menu/manage_apps_section" weight="30">
      <label>Project Viewer Config</label>
      <link>/plugins/servlet/admin/project-viewer-config</link>
    </web-item>
    ```

4.  **Logic Quyền:** Trong `AppServlet` (render trang chính), bạn có thể đọc setting đã lưu. Nếu setting là "disabled", bạn có thể không render trang React mà render một trang "Access Denied".

-----

## Ngày 7: Hoàn thiện & Đóng gói (Polish & Package)

**Mục tiêu:** Thêm spinner, xử lý lỗi, và build file `.jar` cuối cùng.

1.  **Hoàn thiện (Polish):**

      * Dùng `@atlaskit/spinner` bọc quanh bảng. Cho nó hiển thị khi state `isLoading` là `true`.
      * Hiển thị thông báo lỗi nếu API call thất bại.
      * Xử lý "Empty State": Hiển thị một thông báo thân thiện khi không có issue nào.

2.  **Test:** Kiểm tra lại tất cả các luồng: chọn project, phân trang, update, delete, và trang config.

3.  **Build file JAR:**

      * Dọn dẹp:
        ```bash
        atlas-clean
        ```
      * Đóng gói:
        ```bash
        atlas-package
        ```
      * Lệnh này sẽ tạo ra file `target/project-issue-viewer-1.0.0-SNAPSHOT.jar`.

4.  **Cài đặt:** Đây chính là file bạn sẽ upload lên instance Jira DC production qua mục "Manage apps" -\> "Upload app".

Chúc may mắn. Kế hoạch này chặt chẽ nhưng khả thi. Bắt tay vào việc thôi.