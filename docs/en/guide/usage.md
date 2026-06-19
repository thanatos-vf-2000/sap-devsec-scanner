# Running a Scan

## Scan a ZIP project

1. Open the application at `http://localhost:3001`
2. In the **Scan** tab, choose **Upload ZIP**
3. Select your SAP BTP project archive
4. Click **Start scan**

![Scan view](/screenshots/scan.png)

## Scan a local directory

If the application runs on the same server as your project:

1. Select **Local directory**
2. Enter the absolute path to the directory
3. Start the scan

## Reading results

The report is organized by scanner category with a global risk score.

![Scan report](/screenshots/report.png)

## History

Scans are kept in memory for the current session, accessible via the **History** tab.

![History](/screenshots/history.png)