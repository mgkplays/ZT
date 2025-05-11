<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['logFile']) && $_FILES['logFile']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = 'uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $fileName = date('YmdHis') . '_' . $_FILES['logFile']['name'];
        $filePath = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES['logFile']['tmp_name'], $filePath)) {
            // Parse file and build result
            $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            $results = [];

            foreach ($lines as $line) {
                // Example logic, customize as needed
                if (preg_match('/\[(.*?)\] (.*?) 接單 (\d+) 完成 (\d+)/', $line, $matches)) {
                    $steamId = $matches[1];
                    $name = $matches[2];
                    $accepted = (int)$matches[3];
                    $completed = (int)$matches[4];
                    $completion_rate = ($accepted > 0) ? round($completed / $accepted * 100, 2) . '%' : '0%';

                    $results[] = [
                        'steamId' => $steamId,
                        'name' => $name,
                        'accepted' => $accepted,
                        'completed' => $completed,
                        'completion_rate' => $completion_rate
                    ];
                }
            }

            // Save to history
            $history = json_decode(file_get_contents('history.json'), true);
            $history[] = [
                'filename' => $fileName,
                'uploadTime' => date('Y-m-d H:i:s'),
                'path' => $filePath
            ];
            file_put_contents('history.json', json_encode($history, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

            header('Content-Type: application/json');
            echo json_encode($results, JSON_UNESCAPED_UNICODE);
            exit;
        }
    } elseif (isset($_POST['historyFile'])) {
        $json = json_decode(file_get_contents('php://input'), true);
        $path = $json['historyFile'];

        // Repeat parsing logic
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $results = [];

        foreach ($lines as $line) {
            if (preg_match('/\[(.*?)\] (.*?) 接單 (\d+) 完成 (\d+)/', $line, $matches)) {
                $steamId = $matches[1];
                $name = $matches[2];
                $accepted = (int)$matches[3];
                $completed = (int)$matches[4];
                $completion_rate = ($accepted > 0) ? round($completed / $accepted * 100, 2) . '%' : '0%';

                $results[] = [
                    'steamId' => $steamId,
                    'name' => $name,
                    'accepted' => $accepted,
                    'completed' => $completed,
                    'completion_rate' => $completion_rate
                ];
            }
        }

        header('Content-Type: application/json');
        echo json_encode($results, JSON_UNESCAPED_UNICODE);
        exit;
    }
}
?>
