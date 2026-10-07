package com.techlead.ai_tech_lead.compiler;

import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.util.concurrent.*;

@Service
public class CompilerEngine {

    public ExecutionMetrics runJavaSandbox(String sourceCode, String inputData) {

        ExecutionMetrics metrics = new ExecutionMetrics();
        Path tempDir = null;

        try {
            // Create temporary sandbox directory
            tempDir = Files.createTempDirectory("sandbox_runtime_");

            // Create Main.java
            Path sourceFile = tempDir.resolve("Main.java");
            Files.writeString(sourceFile, sourceCode);

            // =========================
            // COMPILATION
            // =========================

            ProcessBuilder compileBuilder =
                    new ProcessBuilder("javac", "Main.java");

            compileBuilder.directory(tempDir.toFile());

            // Merge stderr into stdout so compiler errors are captured
            compileBuilder.redirectErrorStream(true);

            Process compileProcess = compileBuilder.start();

            // Capture compiler output
            String compileOutput =
                    readStream(compileProcess.getInputStream());

            boolean compileCompleted =
                    compileProcess.waitFor(5, TimeUnit.SECONDS);

            // Compilation timeout
            if (!compileCompleted) {

                compileProcess.destroyForcibly();

                metrics.setSuccess(false);
                metrics.setRuntimeStatus("COMPILATION_TIMEOUT");
                metrics.setConsoleLogs(
                        "Compilation timed out after 5000ms."
                );

                return metrics;
            }

            // Compilation failed
            if (compileProcess.exitValue() != 0) {

                metrics.setSuccess(false);
                metrics.setRuntimeStatus("COMPILATION_FAILED");

                metrics.setConsoleLogs(
                        compileOutput.isEmpty()
                                ? "Compilation failed without compiler output."
                                : compileOutput
                );

                return metrics;
            }

            // =========================
            // EXECUTION
            // =========================

            ProcessBuilder runBuilder =
                    new ProcessBuilder("java", "Main");

            runBuilder.directory(tempDir.toFile());

            // Merge stderr into stdout
            runBuilder.redirectErrorStream(true);

            long startTime = System.nanoTime();

            Process runProcess = runBuilder.start();

            // Send input if provided
            if (inputData != null && !inputData.isEmpty()) {

                try (
                        BufferedWriter writer =
                                new BufferedWriter(
                                        new OutputStreamWriter(
                                                runProcess.getOutputStream()
                                        )
                                )
                ) {

                    writer.write(inputData);
                    writer.flush();
                }
            }

            boolean executionCompleted =
                    runProcess.waitFor(2, TimeUnit.SECONDS);

            long endTime = System.nanoTime();

            // Execution timeout
            if (!executionCompleted) {

                runProcess.destroyForcibly();

                metrics.setSuccess(false);
                metrics.setRuntimeStatus("EXECUTION_TIMEOUT");

                metrics.setConsoleLogs(
                        "Runtime Limit Exceeded: " +
                        "Process terminated forcefully at 2000ms threshold."
                );

                return metrics;
            }

            // Capture program output
            String executionOutput =
                    readStream(runProcess.getInputStream());

            metrics.setExecutionDurationMs(
                    (endTime - startTime) / 1_000_000.0
            );

            // Existing placeholder memory value
            metrics.setMemoryConsumptionMb(14.6);

            // =========================
            // RUNTIME RESULT
            // =========================

            if (runProcess.exitValue() != 0) {

                metrics.setSuccess(false);
                metrics.setRuntimeStatus("RUNTIME_CRASH");

                metrics.setConsoleLogs(
                        executionOutput.isEmpty()
                                ? "Runtime crashed without output."
                                : executionOutput
                );

            } else {

                metrics.setSuccess(true);
                metrics.setRuntimeStatus("PASSED");

                metrics.setConsoleLogs(
                        executionOutput.isEmpty()
                                ? "Code executed successfully with zero output."
                                : executionOutput
                );
            }

        } catch (Exception e) {

            metrics.setSuccess(false);
            metrics.setRuntimeStatus("SYSTEM_FAULT");

            metrics.setConsoleLogs(
                    "Internal fault: " + e.getMessage()
            );

        } finally {

            // Cleanup temporary sandbox
            if (tempDir != null) {

                try (var stream = Files.walk(tempDir)) {

                    stream
                            .sorted((a, b) -> b.compareTo(a))
                            .map(Path::toFile)
                            .forEach(File::delete);

                } catch (IOException ignored) {
                }
            }
        }

        return metrics;
    }

    // =========================
    // READ PROCESS OUTPUT
    // =========================

    private String readStream(InputStream stream)
            throws IOException {

        BufferedReader reader =
                new BufferedReader(
                        new InputStreamReader(stream)
                );

        StringBuilder builder =
                new StringBuilder();

        String line;

        while ((line = reader.readLine()) != null) {

            builder.append(line)
                   .append("\n");
        }

        return builder.toString().trim();
    }
}