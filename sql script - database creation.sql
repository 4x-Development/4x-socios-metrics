USE [master]
GO
/****** Object:  Database [db_a44a50_clubindependiente]    Script Date: 5/24/2026 9:13:06 PM ******/
CREATE DATABASE [db_a44a50_clubindependiente]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'db_a44a50_clubindependiente_Data', FILENAME = N'H:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\Data\db_a44a50_clubindependiente_DATA.mdf' , SIZE = 54336KB , MAXSIZE = 1024000KB , FILEGROWTH = 10%)
 LOG ON 
( NAME = N'db_a44a50_clubindependiente_Log', FILENAME = N'H:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\DATA\db_a44a50_clubindependiente_Log.LDF' , SIZE = 3072KB , MAXSIZE = 2048GB , FILEGROWTH = 10%)
 WITH CATALOG_COLLATION = DATABASE_DEFAULT
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET COMPATIBILITY_LEVEL = 150
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [db_a44a50_clubindependiente].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET ARITHABORT OFF 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET  DISABLE_BROKER 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET  MULTI_USER 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET DB_CHAINING OFF 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET QUERY_STORE = OFF
GO
USE [db_a44a50_clubindependiente]
GO
USE [db_a44a50_clubindependiente]
GO
/****** Object:  Sequence [dbo].[sequence]    Script Date: 5/24/2026 9:13:10 PM ******/
CREATE SEQUENCE [dbo].[sequence] 
 AS [bigint]
 START WITH 1
 INCREMENT BY 1
 MINVALUE 1
 MAXVALUE 9223372036854775807
 CACHE 
GO
/****** Object:  UserDefinedTableType [dbo].[PagoTable]    Script Date: 5/24/2026 9:13:10 PM ******/
CREATE TYPE [dbo].[PagoTable] AS TABLE(
	[DNI] [int] NULL,
	[PagoEne] [bit] NULL,
	[PagoFeb] [bit] NULL,
	[PagoMar] [bit] NULL,
	[PagoAbr] [bit] NULL,
	[PagoMay] [bit] NULL,
	[PagoJun] [bit] NULL,
	[PagoJul] [bit] NULL,
	[PagoAgo] [bit] NULL,
	[PagoSep] [bit] NULL,
	[PagoOct] [bit] NULL,
	[PagoNov] [bit] NULL,
	[PagoDic] [bit] NULL
)
GO
/****** Object:  UserDefinedFunction [dbo].[udf_GetNumeric]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [dbo].[udf_GetNumeric]
(@strAlphaNumeric VARCHAR(256))
RETURNS VARCHAR(256)
AS
BEGIN
	DECLARE @intAlpha INT
	DECLARE @Entro INT
	SET @Entro = 0
	SET @intAlpha = PATINDEX('%[^0-9]%', @strAlphaNumeric)

	BEGIN
		WHILE @intAlpha > 0
		BEGIN
			SET @strAlphaNumeric = STUFF(@strAlphaNumeric, @intAlpha, 1, '' )
			SET @intAlpha = PATINDEX('%[^0-9]%', @strAlphaNumeric )
		END
	END
	RETURN ISNULL(@strAlphaNumeric,0)
END
GO
/****** Object:  Table [dbo].[Liquidations]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Liquidations](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[LiquidationDate] [date] NOT NULL,
	[PeriodYear] [int] NULL,
	[PeriodMonth] [int] NULL,
	[FirstExpirationDate] [date] NULL,
	[SecondExpirationDate] [date] NULL,
	[SecondDueSurcharge] [decimal](18, 2) NULL,
	[ClosedDate] [date] NULL,
	[Closed] [bit] NULL,
	[PreviousBalance] [decimal](18, 2) NULL,
	[Active] [bit] NULL,
	[MonthlyInterest] [decimal](18, 2) NULL,
	[InterestAmount] [decimal](18, 2) NULL,
	[InterestPreviousAmount] [decimal](18, 2) NULL,
	[DebtPartnerDrop] [decimal](18, 0) NULL,
	[WAPricePerMessageReceived] [decimal](18, 2) NULL,
	[WAPricePerMessageSent] [decimal](18, 2) NULL,
	[WAModenaSymbol] [nvarchar](10) NULL,
	[SecondDueSurchargeByPartnerType] [decimal](18, 2) NULL,
	[SecondDueSurchargeOnBalance] [decimal](18, 2) NULL,
	[InterestPerMonthOnBalance] [decimal](18, 2) NULL,
 CONSTRAINT [PK_Liquidations] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Receipts]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Receipts](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[PartnerId] [int] NOT NULL,
	[PartnerTypeId] [int] NULL,
	[Passerby] [bit] NULL,
	[LiquidationId] [int] NULL,
	[TotalToPay] [decimal](18, 2) NULL,
	[TotalToPayWithSurcharge] [decimal](18, 2) NULL,
	[Cancelled] [bit] NULL,
	[PaymentId] [int] NULL,
	[CollectorType] [nvarchar](80) NULL,
	[CollectorId] [int] NULL,
	[CollectorFullName] [nvarchar](80) NULL,
	[PaymentAmount] [decimal](18, 2) NULL,
	[PaymentDate] [datetime] NULL,
	[ReceiptGuid] [char](36) NULL,
	[PaymentUserId] [int] NULL,
	[PartnerServiceIdDaily] [int] NULL,
	[PaymentLiquidationId] [int] NULL,
 CONSTRAINT [PK_Receipts] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Partners]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Partners](
	[Id] [int] IDENTITY(2460,1) NOT NULL,
	[DocumentNumber] [nvarchar](50) NOT NULL,
	[PartnerNumber] [int] NULL,
	[PartnerTypeId] [int] NOT NULL,
	[Passerby] [bit] NULL,
	[FirstName] [nvarchar](250) NOT NULL,
	[LastName] [nvarchar](250) NULL,
	[Sex] [nvarchar](1) NULL,
	[FullAddress] [nvarchar](250) NULL,
	[BirthDate] [date] NULL,
	[Mobile] [nvarchar](250) NULL,
	[Email] [nvarchar](250) NULL,
	[AdmissionDate] [date] NULL,
	[Active] [bit] NULL,
	[DropDate] [date] NULL,
	[CollectorId] [int] NULL,
	[Observations] [nvarchar](max) NULL,
	[PartnerGuid] [char](36) NULL,
	[Photo] [varbinary](max) NULL,
	[AddressName] [varchar](50) NULL,
	[AddressNumber] [int] NULL,
	[AddressFloor] [varchar](50) NULL,
	[AddressDepartment] [varchar](50) NULL,
	[RedLinkActive] [bit] NULL,
	[Subscribed] [bit] NULL,
	[DropLiquidationId] [int] NULL,
	[SubscribedWhatsApp] [bit] NULL,
	[IsManageGroup] [bit] NULL,
 CONSTRAINT [PK_Partners] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  View [dbo].[DebtReport]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[DebtReport]
AS
SELECT        R.PartnerId AS PartnerId, COUNT(R.PartnerId) AS Count, SUM(IIF(cast(DATEDIFF(DAY, L.FirstExpirationDate, GETDATE()) AS int) > 0, R.TotalToPayWithSurcharge, R.TotalToPay)) AS Debt
FROM            Receipts AS R INNER JOIN
                         Partners AS P ON P.id = R.PartnerId INNER JOIN
                         Liquidations AS L ON L.Id = R.LiquidationId
WHERE        R.Cancelled = 0
GROUP BY R.PartnerId
GO
/****** Object:  Table [dbo].[Applications]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Applications](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](250) NULL,
	[Description] [nvarchar](50) NULL,
	[Address] [nvarchar](50) NULL,
	[State] [nvarchar](50) NULL,
	[ZipCode] [nvarchar](10) NULL,
	[PhoneNumber] [nvarchar](50) NULL,
	[MobilePhone] [nvarchar](50) NULL,
	[EmailAddress] [nvarchar](50) NULL,
	[WhatsApp] [nvarchar](50) NULL,
	[ShowWhatsApp] [bit] NULL,
	[Logo] [varbinary](max) NULL,
	[SmallLogo] [varbinary](max) NULL,
	[ApplicationGuid] [nvarchar](36) NULL,
	[GeneratesSecondDueSurcharge] [bit] NULL,
	[SecondDueSurcharge] [decimal](18, 2) NULL,
	[MonthlyInterest] [decimal](18, 2) NULL,
	[InitialPeriodYear] [int] NULL,
	[InitialPeriodMonth] [int] NULL,
	[ManagePasserby] [bit] NULL,
	[ManageServices] [bit] NULL,
	[ManageExceptions] [bit] NULL,
	[ManageTeachers] [bit] NULL,
	[ManageSummerClub] [bit] NULL,
	[CollectorIdDefault] [int] NULL,
	[PrintLogoReceipts] [bit] NULL,
	[LiquidationFrequency] [nvarchar](80) NULL,
	[BaseUrlCodeQR] [nvarchar](100) NULL,
	[PrintReceiptsModel] [nvarchar](80) NULL,
	[OrganizationName] [nvarchar](80) NULL,
	[ManageRentail] [bit] NULL,
	[RestrictPublicPaymentInfo] [bit] NULL,
	[BaseUrl] [nvarchar](100) NULL,
	[ManagePartnerModule] [bit] NULL,
	[CredentialType] [nvarchar](80) NULL,
	[CredentialTypeDownload] [nvarchar](80) NULL,
	[CredentialTemplate] [varbinary](max) NULL,
	[ManagePaymentsToAccounts] [bit] NULL,
	[InterestPerMonthAccumulated] [bit] NULL,
	[ManageReceiptsInPartners] [bit] NULL,
	[RegistrationType] [nvarchar](50) NULL,
	[ShowDebtOnCredential] [bit] NULL,
	[PrintMultipleLiquidation] [bit] NULL,
	[VersionAndroid] [nvarchar](100) NOT NULL,
	[VersionIOS] [nvarchar](100) NOT NULL,
	[ManageRedLink] [bit] NULL,
	[ReceiptsDieCuts] [bit] NULL,
	[ReceiptsDieCutsPrintLogo] [bit] NULL,
	[ReceiptsDieCutsType] [nvarchar](50) NULL,
	[SendReceiptsByMail] [bit] NULL,
	[SendReceiptsModelId] [int] NULL,
	[PartnerMovementView] [bit] NULL,
	[SendReceiptsByWhatsapp] [bit] NULL,
	[ManageWhatsapp] [bit] NULL,
	[WAPricePerMessageReceived] [decimal](18, 2) NULL,
	[WAPricePerMessageSent] [decimal](18, 2) NULL,
	[WAModenaSymbol] [nvarchar](10) NULL,
	[GeneratesSecondDueSurchargeByPartnerType] [bit] NULL,
	[SecondDueSurchargeByPartnerType] [decimal](18, 2) NULL,
	[CollectorIdMP] [int] NULL,
	[GeneratesSecondDueSurchargeOnBalance] [bit] NULL,
	[GeneratesInterestPerMonthOnBalance] [bit] NULL,
	[GeneratesQuotaPoolToPasserby] [bit] NULL,
	[InterestPerMonthOnBalance] [decimal](18, 2) NULL,
	[ManageGroups] [bit] NULL,
	[ManageMP] [bit] NULL,
	[PasserbyDiscountCategory] [int] NULL,
	[SecondDueSurchargeOnBalance] [decimal](18, 2) NULL,
	[RegistrationOnlyPartnerNumber] [bit] NULL,
 CONSTRAINT [PK_Settings] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AuditLogDetails]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AuditLogDetails](
	[Id] [bigint] IDENTITY(1,1) NOT NULL,
	[PropertyName] [varchar](256) NOT NULL,
	[OriginalValue] [varchar](512) NULL,
	[NewValue] [varchar](512) NULL,
	[AuditLogId] [bigint] NOT NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AuditLogs]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AuditLogs](
	[AuditLogId] [bigint] IDENTITY(1,1) NOT NULL,
	[UserName] [varchar](300) NULL,
	[EventDateUTC] [datetime] NULL,
	[EventType] [int] NULL,
	[TypeFullName] [varchar](512) NULL,
	[RecordId] [int] NULL,
 CONSTRAINT [PK_AuditLogs] PRIMARY KEY CLUSTERED 
(
	[AuditLogId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Collectors]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Collectors](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[FullName] [nvarchar](80) NULL,
	[Mobile] [nvarchar](50) NULL,
	[Active] [bit] NULL,
	[UserId] [int] NULL,
 CONSTRAINT [PK_Collectors] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[EmailTemplates]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EmailTemplates](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](100) NULL,
	[Description] [nvarchar](300) NULL,
	[Subject] [nvarchar](300) NULL,
	[Body] [nvarchar](max) NULL,
 CONSTRAINT [PK__EmailTemplates] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ErrorCodesRedLink]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ErrorCodesRedLink](
	[Id] [int] NOT NULL,
	[Name] [nvarchar](80) NULL,
	[Active] [bit] NULL,
 CONSTRAINT [PK_ErrorCodesRedLink] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ExtractRedLink]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ExtractRedLink](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ExtractDate] [date] NULL,
	[ImportDate] [date] NULL,
	[EntityId] [nvarchar](3) NULL,
	[Data] [nvarchar](max) NULL,
	[State] [nvarchar](50) NULL,
	[Automatic] [bit] NULL,
 CONSTRAINT [PK_Extract] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ExtractRedLinkDetail]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ExtractRedLinkDetail](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ExtractId] [int] NOT NULL,
	[PartnerId] [int] NOT NULL,
	[PaymentId] [int] NOT NULL,
	[PaymentAmount] [decimal](18, 2) NULL,
	[PaymentDate] [datetime] NULL,
	[Processed] [bit] NULL,
 CONSTRAINT [PK_ExtractDetail] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[FrequentlyQuestions]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[FrequentlyQuestions](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Question] [nvarchar](200) NULL,
	[Answer] [nvarchar](max) NULL,
	[Category] [nvarchar](100) NULL,
	[Keywords] [nvarchar](100) NULL,
	[UsersRole] [nvarchar](100) NULL,
	[Frequently] [int] NULL,
	[UpdateDate] [date] NULL,
 CONSTRAINT [PK_frequentlyQuestions] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Groups]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Groups](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](80) NULL,
	[Active] [bit] NULL,
 CONSTRAINT [PK_Groups] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[LowReceipts]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LowReceipts](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ReceiptId] [int] NULL,
	[PaymentId] [int] NULL,
	[CollectorType] [nvarchar](80) NULL,
	[CollectorId] [int] NULL,
	[CollectorFullName] [nvarchar](80) NULL,
	[PaymentAmount] [decimal](18, 2) NULL,
	[PaymentDate] [datetime] NULL,
	[PaymentUserId] [int] NULL,
	[LowUserId] [int] NULL,
	[LowDate] [datetime] NULL,
 CONSTRAINT [PK_LowReceipts] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PartnerCredits]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PartnerCredits](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[CreditDate] [date] NULL,
	[PartnerId] [int] NULL,
	[TransactionType] [nvarchar](1) NULL,
	[Amount] [decimal](18, 2) NULL,
	[ReceiptId] [int] NULL,
	[LiquidationId] [int] NULL,
	[Active] [bit] NULL,
 CONSTRAINT [PK_PartnerCredits] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PartnersGroups]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PartnersGroups](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Manager] [int] NOT NULL,
	[Member] [int] NOT NULL,
	[PartnerRelation] [int] NOT NULL,
	[Active] [bit] NOT NULL,
 CONSTRAINT [PK_PartnersGroups] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PartnersIndividualServices]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PartnersIndividualServices](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[CreatedDate] [date] NULL,
	[PartnerId] [int] NULL,
	[TeacherId] [int] NULL,
	[ServiceId] [int] NULL,
	[Detail] [nvarchar](80) NULL,
	[Amount] [decimal](18, 2) NULL,
	[PeriodApplyYear] [int] NOT NULL,
	[PeriodApplyMonth] [int] NOT NULL,
	[LiquidationId] [int] NULL,
	[Active] [bit] NULL,
	[Aplied] [bit] NULL,
	[CreatedUserId] [int] NULL,
	[Quantity] [int] NULL,
	[GroupId] [int] NULL,
 CONSTRAINT [PK_PartnersIndividualServices] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PartnersRelations]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PartnersRelations](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nchar](100) NOT NULL,
	[AgeLimit] [int] NOT NULL,
	[IdInverseRelationship] [int] NULL,
	[Active] [bit] NOT NULL,
	[CountMaxMember] [int] NULL,
 CONSTRAINT [PK_PartnersRelations] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PartnersTypes]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PartnersTypes](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](150) NULL,
	[Description] [nvarchar](150) NULL,
	[QuotaAmount] [decimal](18, 2) NULL,
	[Active] [bit] NULL,
	[Sex] [nvarchar](1) NULL,
	[StartAge] [int] NULL,
	[EndAge] [int] NULL,
	[Antiquity] [int] NULL,
	[SummerClub] [decimal](18, 2) NULL,
	[DropLiquidationId] [int] NULL,
 CONSTRAINT [PK_PartnersTypes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PartnersTypesDetail]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PartnersTypesDetail](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[PartnerTypeId] [int] NOT NULL,
	[Month] [int] NULL,
	[Active] [bit] NULL,
	[IncludesPool] [bit] NULL,
	[PaymentPercentagePasserby] [decimal](18, 2) NULL,
 CONSTRAINT [PK_PartnersTypesDetail] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PartnersUsers]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PartnersUsers](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[PartnerId] [int] NULL,
	[UserId] [int] NULL,
	[Administrator] [bit] NULL,
	[CreatedDate] [date] NULL,
 CONSTRAINT [PK_PartnersUsers] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PaymentMP]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PaymentMP](
	[Id] [int] NOT NULL,
	[ExternalReference] [nvarchar](36) NULL,
	[TotalAmount] [decimal](18, 2) NULL,
	[PreferenceItem] [nvarchar](max) NULL,
	[PrefernceId] [nvarchar](250) NULL,
	[PartnerId] [int] NULL,
	[UserId] [int] NULL,
	[ReceiptIds] [nvarchar](max) NULL,
	[DateCreation] [datetime] NULL,
	[DateModify] [datetime] NULL,
	[Status] [nvarchar](50) NULL,
	[StatusHistory] [nvarchar](max) NULL,
	[SynchronizedReceipt] [bit] NULL,
 CONSTRAINT [PK_PaymentMP] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ReceiptsDetail]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ReceiptsDetail](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ReceiptId] [int] NOT NULL,
	[TeacherId] [int] NULL,
	[ServiceId] [int] NULL,
	[Detail] [nvarchar](80) NULL,
	[Amount] [decimal](18, 2) NULL,
	[PartnerServiceId] [int] NULL,
	[LiquidationId] [int] NULL,
	[PartnerId] [int] NULL,
	[PartnerTypeId] [int] NULL,
	[Passerby] [bit] NULL,
 CONSTRAINT [PK_ReceiptsDetail] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RefreshRedLink]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RefreshRedLink](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[RefreshDate] [date] NULL,
	[EntityId] [nvarchar](3) NULL,
	[Vol] [int] NULL,
	[Month] [nvarchar](50) NULL,
	[State] [nvarchar](50) NULL,
	[RefreshName] [nvarchar](50) NULL,
	[ControlName] [nvarchar](50) NULL,
	[LiquidationId] [int] NULL,
	[Data] [nvarchar](max) NULL,
	[DataControl] [nvarchar](max) NULL,
 CONSTRAINT [PK_Refresh] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RefreshRedLinkDetail]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RefreshRedLinkDetail](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[RefreshId] [int] NOT NULL,
	[PartnerId] [int] NULL,
	[DataRegisterId] [int] NULL,
	[DataRegister] [nvarchar](250) NULL,
	[Denied] [bit] NULL,
	[DeniedId] [int] NULL,
 CONSTRAINT [PK_RefreshDetail] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RefreshRedLinkReceipts]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RefreshRedLinkReceipts](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[RefreshDetailId] [int] NOT NULL,
	[ReceiptId] [int] NOT NULL,
 CONSTRAINT [PK_RefreshRedLinkReceipts] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RentalPlaces]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RentalPlaces](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](80) NULL,
	[Type] [nvarchar](80) NULL,
	[GroupId] [int] NULL,
	[MaxPlayersPerTeam] [int] NULL,
	[AmountPerShift] [decimal](18, 2) NULL,
	[ShiftDuration] [int] NULL,
	[ShiftInterval] [int] NULL,
	[Active] [bit] NULL,
	[QuotaPerDay] [bit] NULL,
	[ActivePartner] [bit] NULL,
	[AgendaDays] [int] NULL,
	[EnterAllPlayers] [bit] NULL,
	[CancelBeforeShift] [int] NULL,
	[MatchesPerDay] [int] NULL,
	[MatchesFollowed] [int] NULL,
	[NextTurnsNotPlayed] [int] NULL,
	[RepeatMatchesNextDay] [bit] NULL,
	[ReserveShiftWithReservationInCourse] [bit] NULL,
	[IsDouble] [bit] NULL,
	[MinPlayersPerTeam] [int] NULL,
 CONSTRAINT [PK_RentalPlaces] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RentalPlacesAvailable]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RentalPlacesAvailable](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[RentalPlaceId] [int] NULL,
	[FromWeekDay] [int] NULL,
	[ToWeekDay] [int] NULL,
	[FromAvailableHour] [int] NULL,
	[ToAvailableHour] [int] NULL,
	[FromDate] [date] NULL,
	[ToDate] [date] NULL,
	[Available] [bit] NULL,
	[Active] [bit] NULL,
 CONSTRAINT [PK_RentalPlacesAvailable] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Send]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Send](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[LiquidationId] [int] NULL,
	[DateSend] [datetime] NULL,
	[TotalReceipts] [int] NULL,
	[TotalReceiptsSent] [int] NULL,
	[TotalReceiptsNotSent] [int] NULL,
	[TotalNotEmail] [int] NULL,
	[TotalUnSuscribed] [int] NULL,
	[Finish] [bit] NULL,
	[Type] [varchar](50) NULL,
 CONSTRAINT [PK_Send] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SendDetail]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SendDetail](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[PartnerId] [int] NULL,
	[ReceiptId] [int] NULL,
	[Addressee] [varchar](254) NULL,
	[StatusCode] [varchar](50) NULL,
	[SendId] [int] NULL,
	[Message] [text] NULL,
	[MessageId] [nvarchar](300) NULL,
	[SendGuid] [char](36) NULL,
	[Date] [datetime] NULL,
 CONSTRAINT [PK_SendDetail] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SendGridEvents]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SendGridEvents](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Event] [varchar](200) NULL,
	[EmailAddress] [varchar](300) NULL,
	[Category] [varchar](200) NULL,
	[Response] [nvarchar](max) NULL,
	[Attempt] [varchar](200) NULL,
	[EventDate] [datetime] NULL,
	[Url] [varchar](200) NULL,
	[Status] [varchar](200) NULL,
	[Reason] [varchar](2000) NULL,
	[Type] [varchar](200) NULL,
	[MessageId] [varchar](300) NULL,
	[SendGuid] [char](36) NULL,
	[AppName] [nvarchar](200) NULL,
 CONSTRAINT [PK_SendGridEvents] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SendParam]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SendParam](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[SendId] [int] NULL,
	[idLiquidation] [int] NULL,
	[idLiquidationTop] [int] NULL,
	[bottomParnertId] [int] NULL,
	[topParnertId] [int] NULL,
	[parnertTypeId] [int] NULL,
	[collectorId] [int] NULL,
	[order] [int] NULL,
	[fromDateControl] [datetime] NULL,
	[toDateControl] [datetime] NULL,
	[CutRowByPartner] [bit] NULL,
	[Year] [int] NULL,
	[OnlyDebt] [bit] NULL,
	[OnlyDebtSendModel] [int] NULL,
 CONSTRAINT [PK_SendParam] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Services]    Script Date: 5/24/2026 9:13:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Services](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](150) NULL,
	[Description] [nvarchar](150) NULL,
	[DefaultAmount] [decimal](18, 2) NULL,
	[Active] [bit] NULL,
 CONSTRAINT [PK_Services] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SettingRedLink]    Script Date: 5/24/2026 9:13:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SettingRedLink](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ApplicationId] [int] NULL,
	[EntityId] [nvarchar](3) NULL,
	[UserIdentity] [nvarchar](50) NULL,
	[ConceptIdentity] [int] NULL,
	[ConceptName] [nvarchar](50) NULL,
	[CollectorId] [int] NULL,
	[CollectorType] [nvarchar](50) NULL,
	[CollectorFullName] [nvarchar](50) NULL,
	[SecondExpiration] [bit] NULL,
 CONSTRAINT [PK_SettingRedLink] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ShiftBooking]    Script Date: 5/24/2026 9:13:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ShiftBooking](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ReservationDate] [datetime] NULL,
	[ReservationEndDate] [datetime] NULL,
	[ReservationType] [nvarchar](50) NULL,
	[UserId] [int] NULL,
	[PartnerId] [int] NULL,
	[RentalPlaceId] [int] NULL,
	[TotalAmount] [decimal](18, 2) NULL,
	[Applied] [bit] NULL,
	[Active] [bit] NULL,
 CONSTRAINT [PK_ShiftBooking] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ShiftBookingDetail]    Script Date: 5/24/2026 9:13:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ShiftBookingDetail](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ShiftBookingId] [int] NULL,
	[PartnerId] [int] NULL,
	[GuestFullName] [nvarchar](80) NULL,
	[Active] [bit] NULL,
 CONSTRAINT [PK_ShiftBookingDetail] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Teachers]    Script Date: 5/24/2026 9:13:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Teachers](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[FullName] [nvarchar](80) NULL,
	[Mobile] [nvarchar](50) NULL,
	[Active] [bit] NULL,
	[UserId] [int] NULL,
 CONSTRAINT [PK_Teachers] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserRole]    Script Date: 5/24/2026 9:13:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserRole](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](50) NULL,
	[Description] [nvarchar](200) NULL,
 CONSTRAINT [PK_user_role] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Users]    Script Date: 5/24/2026 9:13:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Password] [nvarchar](max) NULL,
	[UserName] [nvarchar](max) NULL,
	[FirstName] [nvarchar](200) NULL,
	[LastName] [nvarchar](200) NULL,
	[EmailAddress] [nvarchar](50) NULL,
	[RoleId] [int] NULL,
	[Active] [bit] NULL,
	[LastPasswordChange] [datetime] NULL,
	[IncomeAttempts] [int] NULL,
	[VerifyExpiredPassword] [bit] NULL,
	[UserGuid] [varchar](36) NULL,
	[VerifyEmail] [bit] NULL,
	[RequestKey] [bit] NULL,
 CONSTRAINT [PK_users] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UsersAccess]    Script Date: 5/24/2026 9:13:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UsersAccess](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NULL,
	[LastUserAccess] [datetime] NULL,
 CONSTRAINT [PK_LastUserAccess] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WhatsAppMessage]    Script Date: 5/24/2026 9:13:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WhatsAppMessage](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[From] [nvarchar](100) NULL,
	[To] [nvarchar](100) NULL,
	[Body] [nvarchar](max) NULL,
	[VerifyNumber] [bit] NULL,
	[VerifyDocument] [bit] NULL,
	[VerifyPartner] [bit] NULL,
	[Date] [datetime] NULL,
	[PartnerId] [int] NULL,
	[Thread] [int] NULL,
	[Type] [int] NULL,
	[MessageSid] [nvarchar](100) NULL,
	[MessageStatus] [nvarchar](max) NULL,
	[LiquidationId] [int] NULL,
 CONSTRAINT [PK_WhatsAppMessage] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Index [IDX_PartnerTypeId]    Script Date: 5/24/2026 9:13:11 PM ******/
CREATE NONCLUSTERED INDEX [IDX_PartnerTypeId] ON [dbo].[PartnersTypesDetail]
(
	[PartnerTypeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Applications] ADD  CONSTRAINT [DF__Applicati__Versi__73852659]  DEFAULT ('') FOR [VersionAndroid]
GO
ALTER TABLE [dbo].[Applications] ADD  CONSTRAINT [DF__Applicati__Versi__74794A92]  DEFAULT ('') FOR [VersionIOS]
GO
ALTER TABLE [dbo].[Liquidations] ADD  DEFAULT ((0)) FOR [MonthlyInterest]
GO
ALTER TABLE [dbo].[SettingRedLink] ADD  CONSTRAINT [DF__SettingRedL__Vol__2A6B46EF]  DEFAULT ((1)) FOR [UserIdentity]
GO
ALTER TABLE [dbo].[AuditLogDetails]  WITH CHECK ADD  CONSTRAINT [FK_AuditLogDetails_AuditLogs] FOREIGN KEY([AuditLogId])
REFERENCES [dbo].[AuditLogs] ([AuditLogId])
GO
ALTER TABLE [dbo].[AuditLogDetails] CHECK CONSTRAINT [FK_AuditLogDetails_AuditLogs]
GO
ALTER TABLE [dbo].[Collectors]  WITH CHECK ADD  CONSTRAINT [FK_Collectors_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[Collectors] CHECK CONSTRAINT [FK_Collectors_Users]
GO
ALTER TABLE [dbo].[LowReceipts]  WITH CHECK ADD  CONSTRAINT [FK_LowReceipts_Receipts] FOREIGN KEY([ReceiptId])
REFERENCES [dbo].[Receipts] ([Id])
GO
ALTER TABLE [dbo].[LowReceipts] CHECK CONSTRAINT [FK_LowReceipts_Receipts]
GO
ALTER TABLE [dbo].[PartnerCredits]  WITH CHECK ADD  CONSTRAINT [FK_PartnerCredits_PartnerCredits] FOREIGN KEY([Id])
REFERENCES [dbo].[PartnerCredits] ([Id])
GO
ALTER TABLE [dbo].[PartnerCredits] CHECK CONSTRAINT [FK_PartnerCredits_PartnerCredits]
GO
ALTER TABLE [dbo].[PartnerCredits]  WITH CHECK ADD  CONSTRAINT [FK_PartnerCredits_PartnerCredits1] FOREIGN KEY([Id])
REFERENCES [dbo].[PartnerCredits] ([Id])
GO
ALTER TABLE [dbo].[PartnerCredits] CHECK CONSTRAINT [FK_PartnerCredits_PartnerCredits1]
GO
ALTER TABLE [dbo].[PartnerCredits]  WITH CHECK ADD  CONSTRAINT [FK_PartnerCredits_Partners] FOREIGN KEY([PartnerId])
REFERENCES [dbo].[Partners] ([Id])
GO
ALTER TABLE [dbo].[PartnerCredits] CHECK CONSTRAINT [FK_PartnerCredits_Partners]
GO
ALTER TABLE [dbo].[Partners]  WITH CHECK ADD  CONSTRAINT [FK_Partners_Collectors] FOREIGN KEY([CollectorId])
REFERENCES [dbo].[Collectors] ([Id])
GO
ALTER TABLE [dbo].[Partners] CHECK CONSTRAINT [FK_Partners_Collectors]
GO
ALTER TABLE [dbo].[Partners]  WITH CHECK ADD  CONSTRAINT [FK_Partners_PartnersTypes] FOREIGN KEY([PartnerTypeId])
REFERENCES [dbo].[PartnersTypes] ([Id])
GO
ALTER TABLE [dbo].[Partners] CHECK CONSTRAINT [FK_Partners_PartnersTypes]
GO
ALTER TABLE [dbo].[PartnersGroups]  WITH CHECK ADD  CONSTRAINT [FK_PartnersGroups_Manager] FOREIGN KEY([Manager])
REFERENCES [dbo].[Partners] ([Id])
GO
ALTER TABLE [dbo].[PartnersGroups] CHECK CONSTRAINT [FK_PartnersGroups_Manager]
GO
ALTER TABLE [dbo].[PartnersGroups]  WITH CHECK ADD  CONSTRAINT [FK_PartnersGroups_Member] FOREIGN KEY([Member])
REFERENCES [dbo].[Partners] ([Id])
GO
ALTER TABLE [dbo].[PartnersGroups] CHECK CONSTRAINT [FK_PartnersGroups_Member]
GO
ALTER TABLE [dbo].[PartnersGroups]  WITH CHECK ADD  CONSTRAINT [FK_PartnersGroups_PartnerRelation] FOREIGN KEY([PartnerRelation])
REFERENCES [dbo].[PartnersRelations] ([Id])
GO
ALTER TABLE [dbo].[PartnersGroups] CHECK CONSTRAINT [FK_PartnersGroups_PartnerRelation]
GO
ALTER TABLE [dbo].[PartnersIndividualServices]  WITH CHECK ADD  CONSTRAINT [FK_PartnersIndividualServices_Liquidations] FOREIGN KEY([LiquidationId])
REFERENCES [dbo].[Liquidations] ([Id])
GO
ALTER TABLE [dbo].[PartnersIndividualServices] CHECK CONSTRAINT [FK_PartnersIndividualServices_Liquidations]
GO
ALTER TABLE [dbo].[PartnersIndividualServices]  WITH CHECK ADD  CONSTRAINT [FK_PartnersIndividualServices_Partners] FOREIGN KEY([PartnerId])
REFERENCES [dbo].[Partners] ([Id])
GO
ALTER TABLE [dbo].[PartnersIndividualServices] CHECK CONSTRAINT [FK_PartnersIndividualServices_Partners]
GO
ALTER TABLE [dbo].[PartnersIndividualServices]  WITH CHECK ADD  CONSTRAINT [FK_PartnersIndividualServices_Services] FOREIGN KEY([ServiceId])
REFERENCES [dbo].[Services] ([Id])
GO
ALTER TABLE [dbo].[PartnersIndividualServices] CHECK CONSTRAINT [FK_PartnersIndividualServices_Services]
GO
ALTER TABLE [dbo].[PartnersIndividualServices]  WITH CHECK ADD  CONSTRAINT [FK_PartnersIndividualServices_Teachers] FOREIGN KEY([TeacherId])
REFERENCES [dbo].[Teachers] ([Id])
GO
ALTER TABLE [dbo].[PartnersIndividualServices] CHECK CONSTRAINT [FK_PartnersIndividualServices_Teachers]
GO
ALTER TABLE [dbo].[PartnersIndividualServices]  WITH CHECK ADD  CONSTRAINT [FK_PartnersIndividualServices_Users] FOREIGN KEY([CreatedUserId])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[PartnersIndividualServices] CHECK CONSTRAINT [FK_PartnersIndividualServices_Users]
GO
ALTER TABLE [dbo].[PartnersRelations]  WITH CHECK ADD  CONSTRAINT [FK_PartnersRelations_Self] FOREIGN KEY([IdInverseRelationship])
REFERENCES [dbo].[PartnersRelations] ([Id])
GO
ALTER TABLE [dbo].[PartnersRelations] CHECK CONSTRAINT [FK_PartnersRelations_Self]
GO
ALTER TABLE [dbo].[PartnersTypesDetail]  WITH CHECK ADD  CONSTRAINT [FK_PartnersTypesDetail_PartnersTypes] FOREIGN KEY([PartnerTypeId])
REFERENCES [dbo].[PartnersTypes] ([Id])
GO
ALTER TABLE [dbo].[PartnersTypesDetail] CHECK CONSTRAINT [FK_PartnersTypesDetail_PartnersTypes]
GO
ALTER TABLE [dbo].[PartnersUsers]  WITH CHECK ADD  CONSTRAINT [FK_PartnersUsers_Partners] FOREIGN KEY([PartnerId])
REFERENCES [dbo].[Partners] ([Id])
GO
ALTER TABLE [dbo].[PartnersUsers] CHECK CONSTRAINT [FK_PartnersUsers_Partners]
GO
ALTER TABLE [dbo].[PartnersUsers]  WITH CHECK ADD  CONSTRAINT [FK_PartnersUsers_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[PartnersUsers] CHECK CONSTRAINT [FK_PartnersUsers_Users]
GO
ALTER TABLE [dbo].[Receipts]  WITH CHECK ADD  CONSTRAINT [FK_Receipts_Liquidations] FOREIGN KEY([LiquidationId])
REFERENCES [dbo].[Liquidations] ([Id])
GO
ALTER TABLE [dbo].[Receipts] CHECK CONSTRAINT [FK_Receipts_Liquidations]
GO
ALTER TABLE [dbo].[Receipts]  WITH CHECK ADD  CONSTRAINT [FK_Receipts_Partners] FOREIGN KEY([PartnerId])
REFERENCES [dbo].[Partners] ([Id])
GO
ALTER TABLE [dbo].[Receipts] CHECK CONSTRAINT [FK_Receipts_Partners]
GO
ALTER TABLE [dbo].[Receipts]  WITH CHECK ADD  CONSTRAINT [FK_Receipts_PartnersTypes] FOREIGN KEY([PartnerTypeId])
REFERENCES [dbo].[PartnersTypes] ([Id])
GO
ALTER TABLE [dbo].[Receipts] CHECK CONSTRAINT [FK_Receipts_PartnersTypes]
GO
ALTER TABLE [dbo].[Receipts]  WITH CHECK ADD  CONSTRAINT [FK_Receipts_Users] FOREIGN KEY([PaymentUserId])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[Receipts] CHECK CONSTRAINT [FK_Receipts_Users]
GO
ALTER TABLE [dbo].[ReceiptsDetail]  WITH CHECK ADD  CONSTRAINT [FK_ReceiptsDetail_Receipts] FOREIGN KEY([ReceiptId])
REFERENCES [dbo].[Receipts] ([Id])
GO
ALTER TABLE [dbo].[ReceiptsDetail] CHECK CONSTRAINT [FK_ReceiptsDetail_Receipts]
GO
ALTER TABLE [dbo].[ReceiptsDetail]  WITH CHECK ADD  CONSTRAINT [FK_ReceiptsDetail_Services] FOREIGN KEY([ServiceId])
REFERENCES [dbo].[Services] ([Id])
GO
ALTER TABLE [dbo].[ReceiptsDetail] CHECK CONSTRAINT [FK_ReceiptsDetail_Services]
GO
ALTER TABLE [dbo].[ReceiptsDetail]  WITH CHECK ADD  CONSTRAINT [FK_ReceiptsDetail_Teachers] FOREIGN KEY([TeacherId])
REFERENCES [dbo].[Teachers] ([Id])
GO
ALTER TABLE [dbo].[ReceiptsDetail] CHECK CONSTRAINT [FK_ReceiptsDetail_Teachers]
GO
ALTER TABLE [dbo].[RentalPlaces]  WITH CHECK ADD  CONSTRAINT [FK_RentalPlaces_Groups] FOREIGN KEY([GroupId])
REFERENCES [dbo].[Groups] ([Id])
GO
ALTER TABLE [dbo].[RentalPlaces] CHECK CONSTRAINT [FK_RentalPlaces_Groups]
GO
ALTER TABLE [dbo].[RentalPlacesAvailable]  WITH CHECK ADD  CONSTRAINT [FK_RentalPlacesAvailable_RentalPlaces] FOREIGN KEY([RentalPlaceId])
REFERENCES [dbo].[RentalPlaces] ([Id])
GO
ALTER TABLE [dbo].[RentalPlacesAvailable] CHECK CONSTRAINT [FK_RentalPlacesAvailable_RentalPlaces]
GO
ALTER TABLE [dbo].[Send]  WITH CHECK ADD  CONSTRAINT [FK_Send_Liquidations] FOREIGN KEY([LiquidationId])
REFERENCES [dbo].[Liquidations] ([Id])
GO
ALTER TABLE [dbo].[Send] CHECK CONSTRAINT [FK_Send_Liquidations]
GO
ALTER TABLE [dbo].[SendDetail]  WITH CHECK ADD  CONSTRAINT [FK_SendDetail_Partners] FOREIGN KEY([PartnerId])
REFERENCES [dbo].[Partners] ([Id])
GO
ALTER TABLE [dbo].[SendDetail] CHECK CONSTRAINT [FK_SendDetail_Partners]
GO
ALTER TABLE [dbo].[SendDetail]  WITH CHECK ADD  CONSTRAINT [FK_SendDetail_Receipts] FOREIGN KEY([ReceiptId])
REFERENCES [dbo].[Receipts] ([Id])
GO
ALTER TABLE [dbo].[SendDetail] CHECK CONSTRAINT [FK_SendDetail_Receipts]
GO
ALTER TABLE [dbo].[SendDetail]  WITH CHECK ADD  CONSTRAINT [FK_SendDetail_Send] FOREIGN KEY([SendId])
REFERENCES [dbo].[Send] ([Id])
GO
ALTER TABLE [dbo].[SendDetail] CHECK CONSTRAINT [FK_SendDetail_Send]
GO
ALTER TABLE [dbo].[ShiftBooking]  WITH CHECK ADD  CONSTRAINT [FK_ShiftBooking_Partners] FOREIGN KEY([PartnerId])
REFERENCES [dbo].[Partners] ([Id])
GO
ALTER TABLE [dbo].[ShiftBooking] CHECK CONSTRAINT [FK_ShiftBooking_Partners]
GO
ALTER TABLE [dbo].[ShiftBooking]  WITH CHECK ADD  CONSTRAINT [FK_ShiftBooking_RentalPlaces] FOREIGN KEY([RentalPlaceId])
REFERENCES [dbo].[RentalPlaces] ([Id])
GO
ALTER TABLE [dbo].[ShiftBooking] CHECK CONSTRAINT [FK_ShiftBooking_RentalPlaces]
GO
ALTER TABLE [dbo].[ShiftBookingDetail]  WITH CHECK ADD  CONSTRAINT [FK_ShiftBookingDetail_ShiftBooking] FOREIGN KEY([ShiftBookingId])
REFERENCES [dbo].[ShiftBooking] ([Id])
GO
ALTER TABLE [dbo].[ShiftBookingDetail] CHECK CONSTRAINT [FK_ShiftBookingDetail_ShiftBooking]
GO
ALTER TABLE [dbo].[Teachers]  WITH CHECK ADD  CONSTRAINT [FK_Teachers_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[Teachers] CHECK CONSTRAINT [FK_Teachers_Users]
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD  CONSTRAINT [FK_users_userrole] FOREIGN KEY([RoleId])
REFERENCES [dbo].[UserRole] ([Id])
GO
ALTER TABLE [dbo].[Users] CHECK CONSTRAINT [FK_users_userrole]
GO
ALTER TABLE [dbo].[UsersAccess]  WITH CHECK ADD  CONSTRAINT [FK_UsersAccess_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[UsersAccess] CHECK CONSTRAINT [FK_UsersAccess_Users]
GO
/****** Object:  StoredProcedure [dbo].[GetPartners]    Script Date: 5/24/2026 9:13:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[GetPartners]
@CurrentDate as Date
AS
BEGIN

SELECT 
    dbo.Partners.Id, 
    ISNULL(DATEDIFF(YEAR, dbo.Partners.BirthDate, @CurrentDate) - 
           CASE 
               WHEN MONTH(dbo.Partners.BirthDate) > MONTH(@CurrentDate) 
               OR (MONTH(dbo.Partners.BirthDate) = MONTH(@CurrentDate) AND DAY(dbo.Partners.BirthDate) > DAY(@CurrentDate)) 
               THEN 1 ELSE 0 END, 0) AS PartnerAge, 
    ISNULL(DATEDIFF(YEAR, dbo.Partners.AdmissionDate, @CurrentDate) - 
           CASE 
               WHEN MONTH(dbo.Partners.AdmissionDate) > MONTH(@CurrentDate) 
               OR (MONTH(dbo.Partners.AdmissionDate) = MONTH(@CurrentDate) AND DAY(dbo.Partners.AdmissionDate) > DAY(@CurrentDate)) 
               THEN 1 ELSE 0 END, 0) AS PartnerAntiquity,
    dbo.Partners.DocumentNumber, 
    dbo.Partners.PartnerNumber, 
    dbo.Partners.PartnerTypeId, 
    dbo.Partners.Passerby, 
    dbo.Partners.FirstName, 
    dbo.Partners.LastName, 
    dbo.Partners.Sex AS PartnerSex,
	Trim(dbo.Partners.AddressName + ' ' + Cast(dbo.Partners.AddressNumber as nvarchar(10)) + ' ' + dbo.Partners.AddressDepartment + ' ' + dbo.Partners.AddressFloor) as AddressName,
	dbo.Partners.BirthDate, 
    dbo.Partners.Mobile, 
    dbo.Partners.Email, 
    dbo.Partners.AdmissionDate, 
    dbo.Partners.Active AS PartnerActive, 
    dbo.Partners.PartnerGuid, 
    dbo.PartnersTypes.Name, 
    dbo.PartnersTypes.Description, 
    dbo.PartnersTypes.QuotaAmount, 
    dbo.PartnersTypes.Active, 
    dbo.PartnersTypes.Sex, 
    dbo.PartnersTypes.StartAge, 
    dbo.PartnersTypes.EndAge, 
    dbo.PartnersTypes.Antiquity, 
    dbo.PartnersTypes.SummerClub
FROM 
    dbo.Partners 
LEFT JOIN 
    dbo.PartnersTypes ON dbo.Partners.PartnerTypeId = dbo.PartnersTypes.Id
ORDER BY
    dbo.Partners.LastName,
	dbo.Partners.FirstName
END
GO
/****** Object:  StoredProcedure [dbo].[GetPendingReceiptsByIdPartner]    Script Date: 5/24/2026 9:13:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[GetPendingReceiptsByIdPartner]
@PartnerNumber as int,
@PaymentDate as Date
AS
BEGIN

DECLARE @GeneratesSecondDueSurcharge as bit
DECLARE @MonthlyInterest as decimal
DECLARE @ServiceId as decimal
DECLARE @ReceiptsCount as int
DECLARE @Id as int

SELECT @Id = Id
	FROM Partners
	WHERE PartnerNumber = @PartnerNumber

SELECT TOP 1 @GeneratesSecondDueSurcharge = GeneratesSecondDueSurcharge,
	         @MonthlyInterest = MonthlyInterest
FROM Applications

SELECT TOP 1 @ServiceId = Id
FROM Services
WHERE Name = 'Intereses' And Active = 1

IF @GeneratesSecondDueSurcharge = 0 AND @MonthlyInterest > 0 AND @ServiceId > 0
BEGIN
    Select @ReceiptsCount = Count(*)
		From Receipts
		LEFT JOIN Liquidations ON Receipts.LiquidationId = Liquidations.Id
		LEFT JOIN Partners ON Receipts.PartnerId = Partners.Id
	    Where PartnerId = @Id
		      And Cancelled = 0
			  And DATEDIFF(DAY,Liquidations.FirstExpirationDate, GETDATE()) > 0

	IF @ReceiptsCount > 0
    BEGIN
	   Delete From ReceiptsDetail
	   Where ReceiptsDetail.ReceiptId in (Select Receipts.Id
			        	   From Receipts
							    LEFT JOIN Liquidations ON Receipts.LiquidationId = Liquidations.Id
		                        LEFT JOIN Partners ON Receipts.PartnerId = Partners.Id
	                       Where Receipts.PartnerId = @Id
		                         And Receipts.Cancelled = 0
			                     And DATEDIFF(DAY,Liquidations.FirstExpirationDate, @PaymentDate) > 0)
			 And ReceiptsDetail.ServiceId = @ServiceId

       Insert Into ReceiptsDetail(ReceiptId, ServiceId, Detail, Amount)
	   Select Receipts.Id, @ServiceId,
	       'Saldo: $' + CONVERT(varchar(80), Receipts.TotalToPay) +
		   ' - Dias: ' + Convert(varchar(10),DATEDIFF(DAY,Liquidations.FirstExpirationDate, @PaymentDate)) +
		   ' - Interés: ',
			Round(Receipts.TotalToPay * DATEDIFF(DAY,Liquidations.FirstExpirationDate, @PaymentDate) * @MonthlyInterest / 30 / 100,2)
			From Receipts
				LEFT JOIN Liquidations ON Receipts.LiquidationId = Liquidations.Id
				LEFT JOIN Partners ON Receipts.PartnerId = Partners.Id
		    Where PartnerId = @Id
		          And Cancelled = 0
			      And DATEDIFF(DAY,Liquidations.FirstExpirationDate, @PaymentDate) > 0

		Update Receipts
			Set TotalToPayWithSurcharge = (Select Sum(Amount) From ReceiptsDetail Where ReceiptId = Receipts.Id)
			From Receipts
				LEFT JOIN Liquidations ON Receipts.LiquidationId = Liquidations.Id
				LEFT JOIN Partners ON Receipts.PartnerId = Partners.Id
			Where PartnerId = @Id
			      And Cancelled = 0
			      And DATEDIFF(DAY,Liquidations.FirstExpirationDate, @PaymentDate) > 0
	END
END
END
GO
/****** Object:  StoredProcedure [dbo].[Integration_DeletePayment]    Script Date: 5/24/2026 9:13:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[Integration_DeletePayment]
	@IdReceipt as int, @UserId as int
AS
BEGIN
DECLARE @Complete as int
DECLARE @Message as varchar(250)

DECLARE @Id as int
DECLARE @IdDebt as int
DECLARE @LiquidationId as int
DECLARE @PaymentId as int 
DECLARE @CollectorType as nvarchar(80) 
DECLARE @CollectorId as int 
DECLARE @CollectorFullName as nvarchar(80) 
DECLARE @PaymentAmount as decimal(18, 2) 
DECLARE @PaymentUserId as int 
DECLARE @PaymentDate as datetime 
DECLARE @MoreReceiptId as int
DECLARE @PartnerId as int

DECLARE @LiquidationActive as bit
 
  select @IdDebt = Id
  from Receipts where Id = @IdReceipt and Cancelled = 0

  select @Id = Id,@LiquidationId = PaymentLiquidationId, @PaymentId = PaymentId, @CollectorType = CollectorType,
  @CollectorId = CollectorId , @CollectorFullName = CollectorFullName,
  @PaymentAmount = PaymentAmount , @PaymentDate = PaymentDate, @PaymentUserId = PaymentUserId, @PartnerId = PartnerId
  from Receipts where Id = @IdReceipt and Cancelled = 1

  Select @LiquidationActive = Active from Liquidations where Id = @LiquidationId
  
IF @IdDebt > 0
  BEGIN
    Set @Complete = 0 
    Set @Message ='El recibo a elminar no se encuentra pago en la base de datos de la entidad.'
  END
  ELSE
  BEGIN
  IF @Id is null OR @Id = 0
	BEGIN
	    Set @Complete = 0 
		Set @Message ='No se encuentra el recibo a eliminar en la base de datos de la entidad.'
	END
	ELSE
	BEGIN
	  IF @LiquidationActive = 0
	  BEGIN
		Set @Complete = 0 
		Set @Message ='No se puede eliminar el recibo, ya que la liquidacion de pago no se encuentra activa.'
	  END
	  ELSE
	  BEGIN
		select @MoreReceiptId = Id from Receipts where PartnerId = @PartnerId and Id > @Id and Cancelled = 1
		if @MoreReceiptId is null
		BEGIN
			INSERT INTO [dbo].[LowReceipts]
					   ([ReceiptId]
					   ,[PaymentId]
					   ,[CollectorType]
					   ,[CollectorId]
					   ,[CollectorFullName]
					   ,[PaymentAmount]
					   ,[PaymentDate]
					   ,[PaymentUserId]
					   ,[LowUserId]
					   ,[LowDate])
				 VALUES
					   (@Id, @PaymentId,@CollectorType,@CollectorId, @CollectorFullName,@PaymentAmount,
					   @PaymentDate,@PaymentUserId ,@UserId, GETDATE())

			UPDATE [dbo].[Receipts] Set Cancelled = 0 
						,[PaymentId] = null
					   ,[CollectorType] = null
					   ,[CollectorId] = null
					   ,[CollectorFullName] = null
					   ,[PaymentAmount] = null
					   ,[PaymentDate] = null
					   ,[PaymentUserId] = null
			where Id = @Id

			Set @Complete = 1
			Set @Message ='Pago eliminado con exito.'
			END
			ELSE
			BEGIN 
				Set @Complete = 0 
				Set @Message ='No se puede eliminar el recibo, ya que hay recibos pagos que son posteriores.'
			END
	  END
  END
END
  SELECT @Complete as Complete , @Message as Message
END
GO
/****** Object:  StoredProcedure [dbo].[Integration_GetPendingReceiptsByIdPartner]    Script Date: 5/24/2026 9:13:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[Integration_GetPendingReceiptsByIdPartner]
@PartnerNumber as int
AS
BEGIN

DECLARE @GeneratesSecondDueSurcharge as bit
DECLARE @MonthlyInterest as decimal
DECLARE @ServiceId as decimal
DECLARE @ReceiptsCount as int
DECLARE @Id as int

SELECT @Id = Id
	FROM Partners
	WHERE PartnerNumber = @PartnerNumber

SELECT TOP 1 @GeneratesSecondDueSurcharge = GeneratesSecondDueSurcharge,
	         @MonthlyInterest = MonthlyInterest
FROM Applications

SELECT TOP 1 @ServiceId = Id
FROM Services
WHERE Name = 'Intereses' And Active = 1

IF @GeneratesSecondDueSurcharge = 0 AND @MonthlyInterest > 0 AND @ServiceId > 0
BEGIN
    Select @ReceiptsCount = Count(*)
		From Receipts
		LEFT JOIN Liquidations ON Receipts.LiquidationId = Liquidations.Id
		LEFT JOIN Partners ON Receipts.PartnerId = Partners.Id
	    Where PartnerId = @Id
		      And Cancelled = 0
			  And DATEDIFF(DAY,Liquidations.FirstExpirationDate, GETDATE()) > 0

	IF @ReceiptsCount > 0
    BEGIN
	   Delete From ReceiptsDetail
	   Where ReceiptsDetail.ReceiptId in (Select Receipts.Id
			        	   From Receipts
							    LEFT JOIN Liquidations ON Receipts.LiquidationId = Liquidations.Id
		                        LEFT JOIN Partners ON Receipts.PartnerId = Partners.Id
	                       Where Receipts.PartnerId = @Id
		                         And Receipts.Cancelled = 0
			                     And DATEDIFF(DAY,Liquidations.FirstExpirationDate, GETDATE()) > 0)
			 And ReceiptsDetail.ServiceId = @ServiceId

       Insert Into ReceiptsDetail(ReceiptId, ServiceId, Detail, Amount)
	   Select Receipts.Id, @ServiceId,
	       'Saldo: $' + CONVERT(varchar(80), Receipts.TotalToPay) +
		   ' - Dias: ' + Convert(varchar(10),DATEDIFF(DAY,Liquidations.FirstExpirationDate, GETDATE())) +
		   ' - Interés: ',
			Round(Receipts.TotalToPay * DATEDIFF(DAY,Liquidations.FirstExpirationDate, GETDATE()) * @MonthlyInterest / 30 / 100,2)
			From Receipts
				LEFT JOIN Liquidations ON Receipts.LiquidationId = Liquidations.Id
				LEFT JOIN Partners ON Receipts.PartnerId = Partners.Id
		    Where PartnerId = @Id
		          And Cancelled = 0
			      And DATEDIFF(DAY,Liquidations.FirstExpirationDate, GETDATE()) > 0

		Update Receipts
			Set TotalToPayWithSurcharge = (Select Sum(Amount) From ReceiptsDetail Where ReceiptId = Receipts.Id)
			From Receipts
				LEFT JOIN Liquidations ON Receipts.LiquidationId = Liquidations.Id
				LEFT JOIN Partners ON Receipts.PartnerId = Partners.Id
			Where PartnerId = @Id
			      And Cancelled = 0
			      And DATEDIFF(DAY,Liquidations.FirstExpirationDate, GETDATE()) > 0
	END
END

SELECT Receipts.Id AS IdReceipt
      ,PartnerNumber AS IdPartner 
      ,LiquidationDate
      ,FirstExpirationDate
      ,SecondExpirationDate
      ,PeriodYear AS PeriodYear
      ,PeriodMonth AS PeriodMonth
      ,LiquidationId
      ,TotalToPay
      ,TotalToPayWithSurcharge
      ,Cancelled
	  ,CASE WHEN DATEDIFF(day, GETDATE() ,FirstExpirationDate ) >= 0
			Then TotalToPay else TotalToPayWithSurcharge
			end 
		AS Amount
	  ,CASE When DATEDIFF(day, GETDATE() ,FirstExpirationDate ) >= 0 Then 'Por Vencer' else 'Vencida' end 
		AS [Status]
  FROM  dbo.Receipts
  LEFT JOIN Liquidations ON Receipts.LiquidationId = Liquidations.Id
  LEFT JOIN Partners ON Receipts.PartnerId = Partners.Id
  Where PartnerId = @Id and Cancelled = 0
END
GO
/****** Object:  StoredProcedure [dbo].[Integration_RegisterPayment]    Script Date: 5/24/2026 9:13:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE procedure [dbo].[Integration_RegisterPayment]
@IdReceipt as int,
@PaymentDate as date,
@Amount as Money,
@CollectionPoint as int,
@CollectionPointName as Varchar(80),
@PersonEmailAddress as Varchar(200)

as
begin
Declare @IdPartner as Int
Declare @PaymentLiquidationId as int

Select @PaymentLiquidationId = Id
	   From Liquidations
	   Where Active = 1

Update Receipts
		Set Cancelled = 1,
		    CollectorType = 'CollectorPoint',
		    CollectorId = @CollectionPoint,
			CollectorFullName = @CollectionPointName,
			PaymentAmount = @Amount,
			PaymentDate = @PaymentDate,
			PaymentLiquidationId = @PaymentLiquidationId
Where Id = @IdReceipt


--Select @IdPartner = PartnerNumber 
--From Receipts
--LEFT JOIN Partners ON Receipts.PartnerId = Partners.Id
--Where Receipts.Id = @IdReceipt

--If (Len(@PersonEmailAddress) > 0)
--	Update Partners
--		Set Email = @PersonEmailAddress
--	Where Id = @IdPartner
end
GO
/****** Object:  StoredProcedure [dbo].[Integration_SearchPersonByCriteria]    Script Date: 5/24/2026 9:13:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[Integration_SearchPersonByCriteria]
@SearchValue as nvarchar(100)
AS
BEGIN

SELECT PartnerNumber AS IdPartner
	,DocumentNumber
	,FirstName
	,LastName
	,Name AS Category
	,AddressName + ' ' + Cast(AddressNumber as varchar(50))  + IIF(LEN(AddressFloor) > 0, ' PISO/CASA: ' + AddressFloor,'') + IIF(LEN(AddressDepartment) > 0, ' DEPTO.: ' + AddressDepartment,'') AS [Address]
	,Email AS [EmailAddress]
FROM dbo.Partners S
	LEFT JOIN dbo.PartnersTypes C ON S.PartnerTypeId = C.Id
WHERE S.DocumentNumber like '%' + @SearchValue + '%'
	OR S.PartnerNumber like '%' + @SearchValue + '%'
	OR S.LastName like '%' + @SearchValue + '%'
	OR S.FirstName like '%' + @SearchValue + '%'
ORDER BY LastName, FirstName

END
GO
/****** Object:  StoredProcedure [dbo].[Integration_VoidReceipt]    Script Date: 5/24/2026 9:13:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[Integration_VoidReceipt]
@ReceiptId as int
AS
BEGIN
Update Receipts SET Cancelled = 0,
				    PaymentDate = null,
					CollectorType = null,
					CollectorId = null,
					CollectorFullName = null,
					PaymentAmount = null
		Where Id = @ReceiptId
END
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[40] 4[20] 2[20] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'DebtReport'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'DebtReport'
GO
USE [master]
GO
ALTER DATABASE [db_a44a50_clubindependiente] SET  READ_WRITE 
GO
