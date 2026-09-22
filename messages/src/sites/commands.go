package sites

const (
	CACHE_INVALIDATED            = "CACHE_INVALIDATED"
	CERTIFICATE_DELETED          = "CERTIFICATE_DELETED"
	CERTIFICATE_CREATED          = "CERTIFICATE_CREATED"
	CERTIFICATE_UPDATED          = "CERTIFICATE_UPDATED"
	CERTIFICATE_ISSUED           = "CERTIFICATE_ISSUED"
	CERTIFICATE_PARSED           = "CERTIFICATE_PARSED"
	CERTIFICATE_EXPORTED         = "CERTIFICATE_EXPORTED"
	CERTIFICATES_EXPORTED        = "CERTIFICATES_EXPORTED"
	CERTIFICATES_IMPORTED        = "CERTIFICATES_IMPORTED"
	FILE_DELETED                 = "FILE_DELETED"
	FILE_READ                    = "FILE_READ"
	DIRECTORY_LISTED             = "DIRECTORY_LISTED"
	CERTIFICATE_ANALYZED         = "CERTIFICATE_ANALYZED"
	NAMECHEAP_CONNECTED          = "NAMECHEAP_CONNECTED"
	NAMECHEAP_CREDENTIAL_SAVED   = "NAMECHEAP_CREDENTIAL_SAVED"
	NAMECHEAP_CREDENTIAL_DELETED = "NAMECHEAP_CREDENTIAL_DELETED"
	NAMECHEAP_HOST_ADDED         = "NAMECHEAP_HOST_ADDED"
	NAMECHEAP_HOST_UPDATED       = "NAMECHEAP_HOST_UPDATED"
	NAMECHEAP_HOST_DELETED       = "NAMECHEAP_HOST_DELETED"
)

/*
!CACHE_INVALIDATED
*title*en<Cache refreshed>
*body*en<Certificate cache has been cleared>
*title*zh<缓存已刷新>
*body*zh<证书缓存已清除>
*title*fr<Cache actualisé>
*body*fr<Le cache des certificats a été vidé>

!CERTIFICATE_DELETED
*title*en<Certificate deleted>
*body*en<The certificate has been deleted>
*title*zh<证书已删除>
*body*zh<证书已删除>
*title*fr<Certificat supprimé>
*body*fr<Le certificat a été supprimé>

!CERTIFICATE_CREATED
*title*en<Certificate created>
*body*en<The certificate has been created>
*title*zh<证书已创建>
*body*zh<证书已创建>
*title*fr<Certificat créé>
*body*fr<Le certificat a été créé>

!CERTIFICATE_UPDATED
*title*en<Certificate updated>
*body*en<The certificate has been updated>
*title*zh<证书已更新>
*body*zh<证书已更新>
*title*fr<Certificat mis à jour>
*body*fr<Le certificat a été mis à jour>

!CERTIFICATE_ISSUED
*title*en<Certificate issued>
*body*en<The certificate has been issued>
*title*zh<证书已签发>
*body*zh<证书已签发>
*title*fr<Certificat émis>
*body*fr<Le certificat a été émis>

!CERTIFICATE_PARSED
*title*en<Certificate parsed>
*body*en<Certificate fields have been filled from the PEM>
*title*zh<证书已解析>
*body*zh<已从 PEM 填入证书字段>
*title*fr<Certificat analysé>
*body*fr<Les champs du certificat ont été remplis depuis le PEM>

!CERTIFICATE_EXPORTED
*title*en<Certificate exported>
*body*en<The certificate has been exported to the websites folder>
*title*zh<证书已导出>
*body*zh<证书已导出到 websites 目录>
*title*fr<Certificat exporté>
*body*fr<Le certificat a été exporté vers le dossier websites>

!CERTIFICATES_EXPORTED
*title*en<Certificates exported>
*body*en<Certificates have been exported>
*title*zh<证书已导出>
*body*zh<证书已全部导出>
*title*fr<Certificats exportés>
*body*fr<Les certificats ont été exportés>

!CERTIFICATES_IMPORTED
*title*en<Certificates imported>
*body*en<Certificates have been imported from disk>
*title*zh<证书已导入>
*body*zh<已从磁盘导入证书>
*title*fr<Certificats importés>
*body*fr<Les certificats ont été importés depuis le disque>

!FILE_DELETED
*title*en<Deleted>
*body*en<The item has been deleted>
*title*zh<已删除>
*body*zh<已删除>
*title*fr<Supprimé>
*body*fr<L'élément a été supprimé>

!FILE_READ
*title*en<File read>
*body*en<File content loaded>
*title*zh<文件已读取>
*body*zh<已加载文件内容>
*title*fr<Fichier lu>
*body*fr<Contenu du fichier chargé>

!DIRECTORY_LISTED
*title*en<Directory listed>
*body*en<Directory listing loaded>
*title*zh<目录已列出>
*body*zh<已加载目录列表>
*title*fr<Répertoire listé>
*body*fr<Liste du répertoire chargée>

!CERTIFICATE_ANALYZED
*title*en<Certificate analyzed>
*body*en<Certificate analysis completed>
*title*zh<证书已分析>
*body*zh<证书分析完成>
*title*fr<Certificat analysé>
*body*fr<Analyse du certificat terminée>

!NAMECHEAP_CONNECTED
*title*en<Namecheap connected>
*body*en<Namecheap API credentials verified>
*title*zh<校验成功>
*body*zh<Namecheap API 凭证已校验>
*title*fr<Namecheap connecté>
*body*fr<Identifiants API Namecheap vérifiés>

!NAMECHEAP_CREDENTIAL_SAVED
*title*en<Credential saved>
*body*en<Namecheap API credential has been saved>
*title*zh<凭证已保存>
*body*zh<Namecheap API 凭证已保存>
*title*fr<Identifiant enregistré>
*body*fr<L'identifiant API Namecheap a été enregistré>

!NAMECHEAP_CREDENTIAL_DELETED
*title*en<Credential deleted>
*body*en<Namecheap API credential has been deleted>
*title*zh<凭证已删除>
*body*zh<Namecheap API 凭证已删除>
*title*fr<Identifiant supprimé>
*body*fr<L'identifiant API Namecheap a été supprimé>

!NAMECHEAP_HOST_ADDED
*title*en<Host added>
*body*en<Host record has been added>
*title*zh<已添加 host>
*body*zh<已添加 host 记录>
*title*fr<Hôte ajouté>
*body*fr<L'enregistrement d'hôte a été ajouté>

!NAMECHEAP_HOST_UPDATED
*title*en<Host updated>
*body*en<Host record has been updated>
*title*zh<已更新 host>
*body*zh<已更新 host 记录>
*title*fr<Hôte mis à jour>
*body*fr<L'enregistrement d'hôte a été mis à jour>

!NAMECHEAP_HOST_DELETED
*title*en<Host deleted>
*body*en<Host record has been deleted>
*title*zh<已删除 host>
*body*zh<已删除 host 记录>
*title*fr<Hôte supprimé>
*body*fr<L'enregistrement d'hôte a été supprimé>
*/
