<?php
/**
 * Command to generate a DOCX document through the XMLAPI class
 * Each parameter sets a XML
 */

// get arguments
$arguments = getopt('c:d:b:');

require_once dirname(__FILE__) . '/XMLAPI.inc';

$docx = new XMLAPI($arguments['c']);

// the properties may be in more than one file, add all of them
$filesProperties = explode(' ', $arguments['d']);
foreach ($filesProperties as $filesProperty) {
    $docx->setDocumentProperties($filesProperty);
}

// the contents may be in more than one file, add all of them
$filesContents = explode(' ', $arguments['b']);
foreach ($filesContents as $filesContent) {
    $docx->addContent($filesContent);
}

$docx->render();