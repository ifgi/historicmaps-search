

curl --user admin:20#lodum#10 -i -d 'update=PREFIX luc: <http://www.ontotext.com/owlim/lucene#>
INSERT DATA {
   luc:include luc:setParam "literal" .
   luc:languages luc:setParam "en,de,none" .
   luc:index luc:setParam "literals, bnodes" .
   luc:mapsLiteralIndex  luc:createIndex "true" .
}' http://data.uni-muenster.de:8080/openrdf-workbench/repositories/oldmaps/update;
