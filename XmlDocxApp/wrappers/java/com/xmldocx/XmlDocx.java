package com.xmldocx;

import java.io.*;
import java.lang.Process;
import java.lang.ProcessBuilder;
import java.lang.StringBuilder;
import java.util.ArrayList;

/**
 * Creates a Word document out of a XML file.
 *
 * Example:
 *      XmlDocx doc = new XmlDocx("config.xml");
 *      doc.setDocumentProperties("settings.xml");
 *      doc.addContent("content.xml");
 *      doc.render();
 */
public class XmlDocx 
{
    /**
     * Main config file.
     */
    private String configXml;

    /**
     * Xmldocx absolute path.
     */
    private String xmldocxPath;

    /**
     * Debug mode.
     */
    private boolean debug;

    /**
     * XML content files.
     */
    private ArrayList<String> content;

    /**
     * XML properties files.
     */
    private ArrayList<String> documentProperties;

    /**
     * Constructor.
     * @param  xml XML file with content to be added to the Word document.
     */
    public XmlDocx(String xml) throws FileNotFoundException
    {
        // call the full construct setting debug as false
        this(xml, false);
    }

    /**
     * Constructor.
     * @param  xml XML file with content to be added to the Word document.
     * @param  debug     Enable debug mode
     */
    public XmlDocx(String xml, boolean debug) throws FileNotFoundException
    {
        File xmlFile = new File(xml);

        if (!xmlFile.isFile()) {
            throw new FileNotFoundException("The file does not exist");
        }
        this.configXml = xmlFile.getAbsolutePath();
        this.debug = debug;
        this.content = new ArrayList<String>();
        this.documentProperties = new ArrayList<String>();
        this.xmldocxPath = System.getProperty("user.dir") + File.separator + ".." + File.separator;
    }

    /**
     * XML file with content to be added to the Word document.
     * @param xml XML file path
     */
    public void addContent(String xml) throws FileNotFoundException
    {
        File xmlFile = new File(xml);

        if (!xmlFile.isFile()) {
            throw new FileNotFoundException("The file does not exists.");
        }
        this.content.add(xmlFile.getAbsolutePath());
    }

    /**
     * XML file with the general properties of the Word document.
     * @param xml XML file path
     */
    public void setDocumentProperties(String xml) throws FileNotFoundException
    {
        File xmlFile = new File(xml);

        if (!xmlFile.isFile()) {
            throw new FileNotFoundException("The file does not exists.");
        }
        this.documentProperties.add(xmlFile.getAbsolutePath());
    }

    /**
     * Absolute path to the xmldocx folder
     * @param xmldocxPath Path
     */
    public void setXmldocxPath(String xmldocxPath)
    {
        this.xmldocxPath = xmldocxPath;
    }

    /**
     * Renders Word document out of the XML data.
     */
    public void render()
    {
        // Java doesn't have a join method for arraylist, so create the strings manually
        String documentProperties = "";
        String content = "";

        // join the XML documentProperties into a single string
        StringBuilder sbDocumentProperties = new StringBuilder();
        for(String str : this.documentProperties) {
            sbDocumentProperties.append(" ");
            sbDocumentProperties.append(str);
        }
        documentProperties = sbDocumentProperties.toString();

        // join the XML content into a single string
        StringBuilder sbContent = new StringBuilder();
        for(String str : this.content) {
            sbContent.append(" ");
            sbContent.append(str);
        }
        content = sbContent.toString();

        try {
            Process p = new ProcessBuilder("php", this.xmldocxPath + "xmldocx" + File.separator + "XMLAPICommand.php", "-c" + this.configXml, "-d" + documentProperties, "-b" + content).start();

            if (this.debug) {
                InputStream is = p.getErrorStream();
                InputStreamReader isr = new InputStreamReader(is);
                BufferedReader br = new BufferedReader(isr);
                String line;
                while ((line = br.readLine()) != null) {
                  System.out.println(line);
                }
            }
        } catch(IOException e) {
            System.out.println(e);
        }
    }
}