package com.baby100.service;

import com.jcraft.jsch.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.Properties;

@Service
public class SftpService {

    @Value("${app.upload.sftp.enabled:false}")
    private boolean sftpEnabled;

    @Value("${app.upload.sftp.host:}")
    private String sftpHost;

    @Value("${app.upload.sftp.port:22}")
    private int sftpPort;

    @Value("${app.upload.sftp.username:}")
    private String sftpUsername;

    @Value("${app.upload.sftp.password:}")
    private String sftpPassword;

    @Value("${app.upload.sftp.privateKey:}")
    private String privateKey;

    /**
     * 通过SFTP上传文件到远程服务器
     */
    public void uploadFile(InputStream inputStream, String remotePath, String fileName) throws Exception {
        if (!sftpEnabled) {
            throw new RuntimeException("SFTP未启用");
        }

        Session session = null;
        ChannelSftp channelSftp = null;

        try {
            JSch jsch = new JSch();

            // 如果配置了私钥，使用私钥认证
            if (privateKey != null && !privateKey.isEmpty()) {
                jsch.addIdentity(privateKey);
            }

            session = jsch.getSession(sftpUsername, sftpHost, sftpPort);
            
            // 如果配置了密码，使用密码认证
            if (sftpPassword != null && !sftpPassword.isEmpty()) {
                session.setPassword(sftpPassword);
            }

            // 跳过主机密钥检查（生产环境建议配置known_hosts）
            Properties config = new Properties();
            config.put("StrictHostKeyChecking", "no");
            session.setConfig(config);

            session.connect();

            channelSftp = (ChannelSftp) session.openChannel("sftp");
            channelSftp.connect();

            // 确保远程目录存在
            String[] dirs = remotePath.split("/");
            String currentPath = "";
            for (String dir : dirs) {
                if (dir.isEmpty()) continue;
                currentPath += "/" + dir;
                try {
                    // 尝试切换到目录，如果不存在则创建
                    channelSftp.cd(currentPath);
                } catch (SftpException e) {
                    // 目录不存在，创建它
                    try {
                        channelSftp.mkdir(currentPath);
                        channelSftp.cd(currentPath);
                    } catch (SftpException e2) {
                        // 如果创建失败且不是"目录已存在"的错误，抛出异常
                        if (e2.id != ChannelSftp.SSH_FX_FAILURE) {
                            throw e2;
                        }
                    }
                }
            }

            // 确保在目标目录
            channelSftp.cd(remotePath);

            // 上传文件
            channelSftp.put(inputStream, fileName);

        } finally {
            if (channelSftp != null && channelSftp.isConnected()) {
                channelSftp.disconnect();
            }
            if (session != null && session.isConnected()) {
                session.disconnect();
            }
        }
    }

    /**
     * 检查SFTP是否启用
     */
    public boolean isEnabled() {
        return sftpEnabled;
    }
}

